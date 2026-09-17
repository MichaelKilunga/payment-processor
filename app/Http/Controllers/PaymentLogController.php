<?php

namespace App\Http\Controllers;

use App\Models\PaymentLog;
use App\Services\Gateways\PaymentProcessorManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class PaymentLogController extends Controller
{
    protected PaymentProcessorManager $manager;

    public function __construct(PaymentProcessorManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * Display a paginated & filtered list of payment logs.
     */
    public function index(Request $request)
    {
        $query = PaymentLog::query();

        // Search keyword filter
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('external_reference', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('gateway_reference', 'like', "%{$search}%");
            });
        }

        // Gateway filter
        if ($gateway = $request->input('gateway')) {
            if ($gateway !== 'all') {
                $query->where('gateway', strtolower($gateway));
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', strtolower($status));
            }
        }

        // Per page
        $perPage = (int) $request->input('per_page', 10);
        if ($perPage < 1) {
            $perPage = 10;
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json($logs);
        }

        return view('config.index', ['logs' => $logs]);
    }

    /**
     * Show single log detail.
     */
    public function show(int $id)
    {
        $log = PaymentLog::findOrFail($id);
        return response()->json($log);
    }

    /**
     * Delete a single log record.
     */
    public function destroy(int $id)
    {
        $log = PaymentLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction log deleted successfully.'
        ]);
    }

    /**
     * Bulk delete payment logs.
     */
    public function bulkDelete(Request $request)
    {
        $type = $request->input('type');
        $ids = $request->input('ids', []);

        if ($type === 'all') {
            $count = PaymentLog::query()->delete();
        } else {
            if (empty($ids) || !is_array($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No log IDs provided for bulk deletion.'
                ], 400);
            }
            $count = PaymentLog::whereIn('id', $ids)->delete();
        }

        return response()->json([
            'success' => true,
            'count' => $count,
            'message' => "{$count} transaction log(s) deleted successfully."
        ]);
    }

    /**
     * Retry a single failed transaction log.
     */
    public function retry(int $id)
    {
        $log = PaymentLog::findOrFail($id);

        try {
            $gateway = $this->manager->getGateway($log->gateway);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }

        $rawReq = $log->raw_request ?? [];
        $payload = [
            'amount' => $rawReq['amount'] ?? $log->amount,
            'phone' => $rawReq['phone'] ?? $log->phone,
            'email' => $rawReq['email'] ?? null,
            'name' => $rawReq['name'] ?? null,
            'external_reference' => $rawReq['external_reference'] ?? $log->external_reference,
            'remarks' => $rawReq['remarks'] ?? 'Retry transaction',
        ];

        // Re-call gateway initiation
        $result = $gateway->initiatePayment($payload);

        // Update log status and references
        $log->update([
            'gateway_reference' => $result['gateway_reference'] ?? $log->gateway_reference,
            'status' => $result['success'] ? 'pending' : 'failed',
            'raw_response' => $result['raw_response'] ?? null,
        ]);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Transaction retried successfully! Gateway status set to pending.',
                'log' => $log
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['error'] ?? 'Gateway initiation failed during retry.',
            'log' => $log
        ], 502);
    }

    /**
     * Bulk retry failed payment logs.
     */
    public function bulkRetry(Request $request)
    {
        $ids = $request->input('ids', []);
        $type = $request->input('type');

        $query = PaymentLog::where('status', 'failed');
        if ($type !== 'all_failed' && !empty($ids) && is_array($ids)) {
            $query->whereIn('id', $ids);
        }

        $failedLogs = $query->get();

        if ($failedLogs->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No failed transaction logs selected or found to retry.'
            ], 400);
        }

        $retriedCount = 0;
        $succeededCount = 0;
        $failedCount = 0;

        foreach ($failedLogs as $log) {
            $retriedCount++;
            try {
                $gateway = $this->manager->getGateway($log->gateway);
                $rawReq = $log->raw_request ?? [];
                $payload = [
                    'amount' => $rawReq['amount'] ?? $log->amount,
                    'phone' => $rawReq['phone'] ?? $log->phone,
                    'email' => $rawReq['email'] ?? null,
                    'name' => $rawReq['name'] ?? null,
                    'external_reference' => $rawReq['external_reference'] ?? $log->external_reference,
                    'remarks' => $rawReq['remarks'] ?? 'Bulk retry transaction',
                ];

                $result = $gateway->initiatePayment($payload);

                $log->update([
                    'gateway_reference' => $result['gateway_reference'] ?? $log->gateway_reference,
                    'status' => $result['success'] ? 'pending' : 'failed',
                    'raw_response' => $result['raw_response'] ?? null,
                ]);

                if ($result['success']) {
                    $succeededCount++;
                } else {
                    $failedCount++;
                }
            } catch (\Throwable $e) {
                $failedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'retried_count' => $retriedCount,
            'succeeded_count' => $succeededCount,
            'failed_count' => $failedCount,
            'message' => "Bulk retry completed. {$succeededCount} succeeded, {$failedCount} failed out of {$retriedCount} attempt(s)."
        ]);
    }

    /**
     * Export transaction logs as CSV or JSON.
     */
    public function export(Request $request)
    {
        $query = PaymentLog::query();

        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('external_reference', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('gateway_reference', 'like', "%{$search}%");
            });
        }

        if ($gateway = $request->input('gateway')) {
            if ($gateway !== 'all') {
                $query->where('gateway', strtolower($gateway));
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', strtolower($status));
            }
        }

        $logs = $query->orderBy('created_at', 'desc')->get();
        $format = strtolower($request->input('format', 'csv'));

        if ($format === 'json') {
            return Response::make($logs->toJson(JSON_PRETTY_PRINT), 200, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="transaction_logs_' . date('Ymd_His') . '.json"',
            ]);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transaction_logs_' . date('Ymd_His') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Date', 'External Reference', 'Gateway Reference', 'Gateway', 'Phone', 'Amount (TZS)', 'Status']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '',
                    $log->external_reference,
                    $log->gateway_reference,
                    strtoupper($log->gateway),
                    $log->phone,
                    $log->amount,
                    $log->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
