<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Gateway Control Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --border-focus: #3b82f6;
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --primary-light: #eff6ff;
            --success: #059669;
            --success-bg: #ecfdf5;
            --danger: #dc2626;
            --danger-bg: #fef2f2;
            --warning: #d97706;
            --warning-bg: #fffbeb;
            --text-color: #0f172a;
            --text-muted: #64748b;
            --card-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
            --card-shadow-hover: 0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            background-image: 
                radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.03) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.03) 0px, transparent 50%);
            background-attachment: fixed;
            min-height: 100vh;
            padding: 2.5rem 1rem;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1.5rem;
        }

        .header-title-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .header-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #2563eb, #0284c7);
            color: white;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.3);
        }

        h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-color);
            letter-spacing: -0.02em;
        }

        .header-subtitle {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-top: 0.15rem;
        }

        .active-badge {
            background: var(--success-bg);
            color: var(--success);
            padding: 0.6rem 1.2rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            border: 1px solid rgba(5, 150, 105, 0.2);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 6px rgba(5, 150, 105, 0.08);
        }

        .alert {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .alert-success {
            background: var(--success-bg);
            border: 1px solid rgba(5, 150, 105, 0.2);
            color: var(--success);
        }

        .alert-error {
            background: var(--danger-bg);
            border: 1px solid rgba(220, 38, 38, 0.2);
            color: var(--danger);
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        @media (min-width: 900px) {
            .grid {
                grid-template-columns: 2fr 1fr;
            }
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 2rem;
            box-shadow: var(--card-shadow);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
            box-shadow: var(--card-shadow-hover);
        }

        .card-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.85rem;
        }

        .card-title i {
            color: var(--primary);
        }

        .form-group {
            margin-bottom: 1.35rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        @media (min-width: 600px) {
            .form-row {
                grid-template-columns: 1fr 1fr;
            }
        }

        label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #334155;
        }

        input, select {
            width: 100%;
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            padding: 0.75rem 1rem;
            border-radius: 10px;
            color: var(--text-color);
            font-family: inherit;
            font-size: 0.95rem;
            transition: all 0.2s ease;
        }

        input:focus, select:focus {
            outline: none;
            border-color: var(--border-focus);
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            text-decoration: none;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px -2px rgba(37, 99, 235, 0.4);
        }

        .btn-secondary {
            background: #f1f5f9;
            color: #334155;
            border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
            background: #e2e8f0;
            color: #0f172a;
        }

        .gateway-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .gateway-option {
            border: 2px solid var(--border-color);
            border-radius: 14px;
            padding: 1.25rem;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            background: #ffffff;
        }

        .gateway-option:hover {
            border-color: #93c5fd;
            background: #f8fafc;
        }

        .gateway-option.selected {
            border-color: var(--primary);
            background: var(--primary-light);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .gateway-option i {
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
            color: #94a3b8;
        }

        .gateway-option.selected i {
            color: var(--primary);
        }

        .gateway-option span {
            display: block;
            font-weight: 600;
            color: var(--text-color);
        }

        .gateway-section {
            border: 1.5px solid var(--border-color);
            border-radius: 14px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            background: #fafafa;
        }

        .gateway-section.disabled {
            opacity: 0.5;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
        }

        .section-title {
            font-weight: 700;
            font-size: 1.05rem;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .table-container {
            overflow-x: auto;
            margin-top: 1rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th, td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9rem;
        }

        th {
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            background: #f8fafc;
        }

        tbody tr:hover {
            background: #f8fafc;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .badge-success {
            background: var(--success-bg);
            color: var(--success);
            border: 1px solid rgba(5, 150, 105, 0.2);
        }

        .badge-danger {
            background: var(--danger-bg);
            color: var(--danger);
            border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .badge-pending {
            background: var(--warning-bg);
            color: var(--warning);
            border: 1px solid rgba(217, 119, 6, 0.2);
        }

        .endpoint-box {
            background: #f1f5f9;
            padding: 1.1rem;
            border-radius: 10px;
            font-size: 0.85rem;
            font-family: monospace;
            border: 1px solid #e2e8f0;
        }

        /* ─── Log Panel Controls & Actions ────────────────── */
        .log-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        .log-filter-group {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.5rem;
        }
        .log-input-sm {
            padding: 0.45rem 0.75rem;
            font-size: 0.85rem;
            border-radius: 8px;
            border: 1.5px solid #cbd5e1;
            background: #fff;
        }
        .log-input-sm:focus {
            outline: none;
            border-color: var(--primary);
        }
        .btn-danger {
            background: var(--danger);
            color: white;
        }
        .btn-danger:hover {
            background: #b91c1c;
        }
        .btn-warning {
            background: var(--warning);
            color: white;
        }
        .btn-warning:hover {
            background: #b45309;
        }
        .btn-outline-danger {
            background: transparent;
            color: var(--danger);
            border: 1px solid var(--danger);
        }
        .btn-outline-danger:hover {
            background: var(--danger-bg);
        }
        .btn-sm {
            padding: 0.35rem 0.75rem;
            font-size: 0.8rem;
            border-radius: 6px;
        }
        .log-action-btn {
            width: 28px;
            height: 28px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: #fff;
            color: #475569;
            cursor: pointer;
            transition: all 0.15s;
        }
        .log-action-btn:hover {
            background: #f1f5f9;
            color: #0f172a;
        }
        .log-action-btn.retry:hover {
            background: #fef3c7;
            color: #b45309;
            border-color: #fde68a;
        }
        .log-action-btn.delete:hover {
            background: #fee2e2;
            color: #dc2626;
            border-color: #fca5a5;
        }
        .log-action-btn.details:hover {
            background: #eff6ff;
            color: #2563eb;
            border-color: #bfdbfe;
        }
        /* Pagination UI */
        .pagination-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1.25rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        .pagination-nav {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .page-btn {
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: #fff;
            color: var(--text-color);
            font-size: 0.825rem;
            cursor: pointer;
            font-weight: 500;
        }
        .page-btn:hover:not(:disabled) {
            background: #f1f5f9;
        }
        .page-btn.active {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
        }
        .page-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        /* Log Details Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .modal-overlay.active {
            display: flex;
        }
        .modal-card {
            background: #fff;
            border-radius: 16px;
            width: 100%;
            max-width: 750px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: slideIn 0.2s ease;
        }
        .modal-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .modal-title {
            font-weight: 700;
            font-size: 1.1rem;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: var(--text-muted);
            cursor: pointer;
        }
        .modal-close:hover { color: #0f172a; }
        .modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            font-size: 0.9rem;
        }
        .modal-code-block {
            background: #0f172a;
            color: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.8rem;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 250px;
            overflow-y: auto;
            margin-top: 0.5rem;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-10px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* ─── Tab Navigation ─────────────────────────────────── */
        .tab-nav {
            display: flex;
            gap: 0;
            margin-bottom: 2rem;
            background: #f1f5f9;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 4px;
        }
        .tab-btn {
            flex: 1;
            padding: 0.65rem 1.25rem;
            border-radius: 9px;
            border: none;
            background: transparent;
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .tab-btn:hover { color: var(--text-color); }
        .tab-btn.active {
            background: #fff;
            color: var(--primary);
            box-shadow: 0 2px 8px rgba(15,23,42,0.08);
        }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }

        /* ─── Emulator Panel Styles ──────────────────────────── */
        .em-layout {
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 1.5rem;
            align-items: start;
        }
        @media (max-width: 900px) { .em-layout { grid-template-columns: 1fr; } }

        .em-gateway-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }
        .em-gw-tab {
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            background: #fff;
        }
        .em-gw-tab:hover { border-color: #93c5fd; }
        .em-gw-tab.active-selcom  { border-color: #0ea5e9; background: #f0f9ff; }
        .em-gw-tab.active-azampay { border-color: #8b5cf6; background: #faf5ff; }
        .em-gw-icon { font-size: 1.4rem; margin-bottom: 4px; }
        .em-gw-name { font-size: 0.8rem; font-weight: 700; }
        .em-gw-type { font-size: 0.72rem; color: var(--text-muted); }

        .em-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 1.25rem;
        }
        .em-stat {
            padding: 0.75rem;
            text-align: center;
            border-right: 1px solid var(--border-color);
            background: #fafafa;
        }
        .em-stat:last-child { border-right: none; }
        .em-stat-val { font-size: 1.3rem; font-weight: 800; font-family: monospace; }
        .em-stat-lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 2px; }
        .em-stat-val.pending  { color: var(--warning); }
        .em-stat-val.approved { color: var(--success); }
        .em-stat-val.rejected { color: var(--danger); }
        .em-stat-val.total    { color: var(--primary); }

        .em-filter-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 1rem;
            align-items: center;
        }
        .em-filter-btn {
            padding: 4px 12px;
            border-radius: 99px;
            border: 1px solid var(--border-color);
            background: transparent;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            font-family: inherit;
            transition: all 0.15s;
        }
        .em-filter-btn:hover, .em-filter-btn.active {
            background: var(--primary-light);
            color: var(--primary);
            border-color: #93c5fd;
        }
        .em-filter-spacer { flex: 1; }
        .em-auto-label { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .em-toggle {
            width: 34px; height: 18px;
            background: #e2e8f0;
            border-radius: 99px;
            cursor: pointer;
            position: relative;
            transition: background 0.2s;
            border: none;
        }
        .em-toggle.on { background: var(--primary); }
        .em-toggle-thumb {
            position: absolute; top: 2px; left: 2px;
            width: 14px; height: 14px;
            background: #fff;
            border-radius: 50%;
            transition: left 0.2s;
            pointer-events: none;
        }
        .em-toggle.on .em-toggle-thumb { left: 18px; }

        .em-tx-list { display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding-right: 4px; }
        .em-tx-list::-webkit-scrollbar { width: 4px; }
        .em-tx-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }

        .em-tx-card {
            background: #fafafa;
            border: 1.5px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem 1.1rem;
            display: flex;
            flex-direction: column;
            gap: 10px;
            animation: slideIn 0.25s ease;
            transition: box-shadow 0.2s;
        }
        .em-tx-card:hover { box-shadow: var(--card-shadow); }
        .em-tx-card.gw-selcom  { border-left: 3px solid #0ea5e9; }
        .em-tx-card.gw-azampay { border-left: 3px solid #8b5cf6; }

        .em-tx-top { display: flex; align-items: center; justify-content: space-between; }
        .em-gw-pill {
            font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.06em; padding: 2px 9px; border-radius: 99px;
        }
        .em-gw-pill.selcom  { background: #e0f2fe; color: #0369a1; }
        .em-gw-pill.azampay { background: #ede9fe; color: #6d28d9; }

        .em-status-pill {
            font-size: 0.72rem; font-weight: 700; padding: 2px 9px; border-radius: 99px;
        }
        .em-status-pill.pending  { background: var(--warning-bg); color: var(--warning); }
        .em-status-pill.approved { background: var(--success-bg); color: var(--success); }
        .em-status-pill.rejected { background: var(--danger-bg);  color: var(--danger);  }
        .em-status-pill.timeout  { background: #f1f5f9;           color: #94a3b8;        }

        .em-tx-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 12px;
            font-size: 0.82rem;
        }
        .em-tx-lbl { color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .em-tx-val { font-weight: 600; font-family: monospace; font-size: 0.82rem; }

        .em-tx-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .em-act {
            padding: 5px 12px; border-radius: 7px; font-size: 0.78rem; font-weight: 600;
            border: 1.5px solid; cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .em-act.approve { background: var(--success-bg); color: var(--success); border-color: rgba(5,150,105,0.3); }
        .em-act.approve:hover { background: #d1fae5; }
        .em-act.reject  { background: var(--danger-bg);  color: var(--danger);  border-color: rgba(220,38,38,0.3); }
        .em-act.reject:hover  { background: #fee2e2; }
        .em-act.timeout { background: var(--warning-bg); color: var(--warning); border-color: rgba(217,119,6,0.3); }
        .em-act.timeout:hover { background: #fef3c7; }

        .em-empty {
            text-align: center; padding: 3rem 1rem;
            color: var(--text-muted);
        }
        .em-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.4; }

        .em-info-box {
            background: #f8fafc;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 1rem 1.1rem;
            margin-bottom: 0.75rem;
        }
        .em-info-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 5px; }
        .em-info-url { font-family: monospace; font-size: 0.78rem; color: var(--primary); word-break: break-all; }
        .em-method { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; padding: 1px 6px; border-radius: 4px; background: var(--primary-light); color: var(--primary); margin-right: 4px; }

        .em-fill-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 5px 12px; border-radius: 7px;
            background: #e0f2fe; color: #0369a1;
            border: 1px solid #bae6fd;
            font-size: 0.78rem; font-weight: 600;
            cursor: pointer; font-family: inherit; transition: all 0.15s;
            margin-bottom: 0.75rem;
        }
        .em-fill-btn:hover { background: #bae6fd; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-title-group">
                <div class="header-icon">
                    <i class="fa-solid fa-layer-group"></i>
                </div>
                <div>
                    <h1>Payment Gateway Manager</h1>
                    <div class="header-subtitle">Unified transaction routing & gateway settings</div>
                </div>
            </div>
            <div class="active-badge">
                <i class="fa-solid fa-circle-dot"></i>
                Active: {{ strtoupper($configs['active_gateway'] ?? 'selcom') }}
            </div>
        </header>

        {{-- Tab Navigation --}}
        <div class="tab-nav">
            <button class="tab-btn active" id="tab-config-btn" onclick="switchTab('config')">
                <i class="fa-solid fa-sliders"></i> Configuration
            </button>
            <button class="tab-btn" id="tab-emulator-btn" onclick="switchTab('emulator')">
                <i class="fa-solid fa-flask"></i> Payment Emulator
                <span id="em-pending-badge" style="display:none;background:#fef3c7;color:#d97706;font-size:0.7rem;font-weight:700;padding:1px 7px;border-radius:99px;"></span>
            </button>
        </div>

        @if(session('success'))
            <div class="alert alert-success">
                <i class="fa-solid fa-circle-check"></i>
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-error">
                <i class="fa-solid fa-circle-exclamation"></i>
                {{ session('error') }}
            </div>
        @endif

        <div id="panel-config" class="tab-panel active">
        <div class="grid">
            <!-- Left Column: Settings Form -->
            <div class="card">
                <div class="card-title">
                    <i class="fa-solid fa-sliders"></i> Integration Configurations
                </div>

                <form action="{{ route('config.save') }}" method="POST">
                    @csrf
                    
                    <label>Select Active Payment Gateway</label>
                    <div class="gateway-selector">
                        <div class="gateway-option {{ ($configs['active_gateway'] ?? 'selcom') === 'selcom' ? 'selected' : '' }}" onclick="selectGateway('selcom')">
                            <i class="fa-solid fa-wallet"></i>
                            <span>Selcom Minimal Checkout</span>
                        </div>
                        <div class="gateway-option {{ ($configs['active_gateway'] ?? 'selcom') === 'azampay' ? 'selected' : '' }}" onclick="selectGateway('azampay')">
                            <i class="fa-solid fa-mobile-screen-button"></i>
                            <span>AzamPay Mobile Push</span>
                        </div>
                    </div>
                    <input type="hidden" name="active_gateway" id="active_gateway" value="{{ $configs['active_gateway'] ?? 'selcom' }}">

                    <div class="form-group">
                        <label for="webapp_callback_url"><i class="fa-solid fa-link"></i> Web App Callback URL (Unified Endpoint)</label>
                        <input type="url" name="webapp_callback_url" id="webapp_callback_url" value="{{ $configs['webapp_callback_url'] ?? '' }}" placeholder="http://mywebapp.com/api/v1/payments/callback" required>
                    </div>

                    <!-- Selcom Section -->
                    <div class="gateway-section" id="section_selcom">
                        <div class="section-header">
                            <div class="section-title"><i class="fa-solid fa-wallet" style="color: var(--primary);"></i> Selcom Credentials</div>
                            <button type="submit" name="test_gateway" value="selcom" class="btn btn-secondary"><i class="fa-solid fa-vial"></i> Test</button>
                        </div>
                        <div class="form-group">
                            <label for="selcom_base_url">Selcom Base API URL</label>
                            <input type="url" name="selcom_base_url" id="selcom_base_url" value="{{ $configs['selcom_base_url'] ?? '' }}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="selcom_api_key">Selcom API Key</label>
                                <input type="text" name="selcom_api_key" id="selcom_api_key" value="{{ $configs['selcom_api_key'] ?? '' }}">
                            </div>
                            <div class="form-group">
                                <label for="selcom_secret_key">Selcom Secret Key</label>
                                <input type="password" name="selcom_secret_key" id="selcom_secret_key" value="{{ $configs['selcom_secret_key'] ?? '' }}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="selcom_vendor">Selcom Vendor ID (Till ID)</label>
                            <input type="text" name="selcom_vendor" id="selcom_vendor" value="{{ $configs['selcom_vendor'] ?? '' }}">
                        </div>
                    </div>

                    <!-- AzamPay Section -->
                    <div class="gateway-section" id="section_azampay">
                        <div class="section-header">
                            <div class="section-title"><i class="fa-solid fa-mobile-screen-button" style="color: var(--primary);"></i> AzamPay Credentials</div>
                            <button type="submit" name="test_gateway" value="azampay" class="btn btn-secondary"><i class="fa-solid fa-vial"></i> Test</button>
                        </div>
                        <div class="form-group">
                            <label for="azampay_base_url">AzamPay API URL</label>
                            <input type="url" name="azampay_base_url" id="azampay_base_url" value="{{ $configs['azampay_base_url'] ?? '' }}">
                        </div>
                        <div class="form-group">
                            <label for="azampay_auth_base_url">AzamPay Auth Token URL</label>
                            <input type="url" name="azampay_auth_base_url" id="azampay_auth_base_url" value="{{ $configs['azampay_auth_base_url'] ?? '' }}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="azampay_client_id">Client ID</label>
                                <input type="text" name="azampay_client_id" id="azampay_client_id" value="{{ $configs['azampay_client_id'] ?? '' }}">
                            </div>
                            <div class="form-group">
                                <label for="azampay_client_secret">Client Secret</label>
                                <input type="password" name="azampay_client_secret" id="azampay_client_secret" value="{{ $configs['azampay_client_secret'] ?? '' }}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="azampay_app_name">App Registration Name</label>
                                <input type="text" name="azampay_app_name" id="azampay_app_name" value="{{ $configs['azampay_app_name'] ?? '' }}">
                            </div>
                            <div class="form-group">
                                <label for="azampay_api_key">X-API-KEY</label>
                                <input type="text" name="azampay_api_key" id="azampay_api_key" value="{{ $configs['azampay_api_key'] ?? '' }}">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Configurations</button>
                    </div>
                </form>
            </div>

            <!-- Right Column: Info & Logs -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <div class="card">
                    <div class="card-title">
                        <i class="fa-solid fa-circle-info"></i> API Status
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">
                        The payment processor service is active. Below are the unified endpoints available to your main application:
                    </p>
                    <div class="endpoint-box">
                        <div style="margin-bottom: 0.5rem;"><strong style="color: var(--primary);">POST</strong> /api/v1/payments/initiate</div>
                        <div style="margin-bottom: 0.5rem;"><strong style="color: var(--success);">POST</strong> /api/v1/callbacks/selcom</div>
                        <div><strong style="color: var(--success);">POST</strong> /api/v1/callbacks/azampay</div>
                    </div>
                </div>

                <div class="card" style="grid-column: 1 / -1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                        <div class="card-title" style="margin-bottom: 0;">
                            <i class="fa-solid fa-clock-rotate-left"></i> Latest Transaction Logs
                        </div>
                        <div class="log-filter-group">
                            <button class="btn btn-secondary btn-sm" onclick="exportLogs('csv')" title="Export filtered logs to CSV">
                                <i class="fa-solid fa-file-csv"></i> Export CSV
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="exportLogs('json')" title="Export filtered logs to JSON">
                                <i class="fa-solid fa-file-code"></i> JSON
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="loadLogs(logCurrentPage)" title="Refresh logs">
                                <i class="fa-solid fa-rotate"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <!-- Toolbar: Search and Filters -->
                    <div class="log-toolbar">
                        <div class="log-filter-group" style="flex: 1; min-width: 260px;">
                            <div style="position: relative; flex: 1;">
                                <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
                                <input type="text" id="logSearchInput" class="log-input-sm" placeholder="Search reference, phone..." style="padding-left: 2rem; width: 100%;" oninput="debounceLogSearch()">
                            </div>
                            <select id="logGatewayFilter" class="log-input-sm" onchange="loadLogs(1)">
                                <option value="all">All Gateways</option>
                                <option value="selcom">Selcom</option>
                                <option value="azampay">AzamPay</option>
                            </select>
                            <select id="logStatusFilter" class="log-input-sm" onchange="loadLogs(1)">
                                <option value="all">All Statuses</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div class="log-filter-group">
                            <button id="btnBulkRetry" class="btn btn-warning btn-sm" onclick="bulkRetrySelected()" disabled style="opacity: 0.5;">
                                <i class="fa-solid fa-rotate-right"></i> Retry Selected (<span id="selectedFailedCount">0</span>)
                            </button>
                            <button id="btnBulkDelete" class="btn btn-danger btn-sm" onclick="bulkDeleteSelected()" disabled style="opacity: 0.5;">
                                <i class="fa-solid fa-trash"></i> Delete Selected (<span id="selectedCount">0</span>)
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="clearAllLogs()">
                                <i class="fa-solid fa-dumpster"></i> Clear All Logs
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 36px; text-align: center;">
                                        <input type="checkbox" id="selectAllLogs" onchange="toggleSelectAllLogs(this)">
                                    </th>
                                    <th>Date</th>
                                    <th>Reference</th>
                                    <th>Gateway</th>
                                    <th>Phone</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="logsTableBody">
                                <!-- Loaded dynamically via JS -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Footer -->
                    <div class="pagination-container">
                        <div id="paginationInfo">Showing 0 to 0 of 0 logs</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <label for="logPerPage" style="font-size: 0.85rem;">Per page:</label>
                            <select id="logPerPage" class="log-input-sm" style="padding: 0.25rem 0.5rem;" onchange="loadLogs(1)">
                                <option value="10" selected>10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div id="paginationLinks" class="pagination-nav"></div>
                    </div>
                </div>
            </div>
        </div>
        </div>{{-- /panel-config --}}

        {{-- ─── EMULATOR TAB PANEL ───────────────────────────────────── --}}
        <div id="panel-emulator" class="tab-panel">
            <div class="em-layout">

                {{-- LEFT: Initiate + Emulator URLs --}}
                <div style="display:flex;flex-direction:column;gap:1.5rem;">

                    {{-- Quick-fill emulator URLs --}}
                    <div class="card" style="padding:1.5rem;">
                        <div class="card-title"><i class="fa-solid fa-plug"></i> Quick Setup</div>
                        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Click to auto-fill the gateway URLs in the Config tab with emulator endpoints, then save.</p>
                        <button class="em-fill-btn" onclick="fillEmulatorUrls()">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-fill Emulator URLs
                        </button>
                        <div class="em-info-box">
                            <div class="em-info-label">🟢 AzamPay Base URL &amp; Auth URL</div>
                            <div class="em-info-url"><span class="em-method">BASE</span>{{ url('/api/emulator/azampay') }}</div>
                        </div>
                        <div class="em-info-box">
                            <div class="em-info-label">🏦 Selcom Base URL</div>
                            <div class="em-info-url"><span class="em-method">BASE</span>{{ url('/api/emulator/selcom') }}</div>
                        </div>
                        <div class="em-info-box" style="margin-bottom:0;">
                            <div class="em-info-label">📤 Processor Initiate Endpoint</div>
                            <div class="em-info-url"><span class="em-method">POST</span>{{ url('/api/v1/payments/initiate') }}</div>
                        </div>
                    </div>

                    {{-- Initiate Test Payment --}}
                    <div class="card" style="padding:1.5rem;">
                        <div class="card-title"><i class="fa-solid fa-bolt"></i> Initiate Test Payment</div>

                        <div class="em-gateway-tabs">
                            <div class="em-gw-tab active-selcom" id="em-tab-selcom" onclick="emSelectGateway('selcom')">
                                <div class="em-gw-icon">🏦</div>
                                <div class="em-gw-name" style="color:#0369a1;">Selcom</div>
                                <div class="em-gw-type">Checkout URL</div>
                            </div>
                            <div class="em-gw-tab" id="em-tab-azampay" onclick="emSelectGateway('azampay')">
                                <div class="em-gw-icon">📲</div>
                                <div class="em-gw-name" style="color:#6d28d9;">AzamPay</div>
                                <div class="em-gw-type">USSD Push</div>
                            </div>
                        </div>

                        <form id="emForm" onsubmit="emInitiatePayment(event)">
                            <input type="hidden" id="emGateway" value="selcom" />
                            <div class="form-group">
                                <label for="emAmount">Amount (TZS)</label>
                                <input class="" type="number" id="emAmount" placeholder="e.g. 5000" min="1" required style="width:100%;background:#fff;border:1.5px solid #cbd5e1;padding:0.7rem 1rem;border-radius:10px;font-family:inherit;font-size:0.9rem;" />
                            </div>
                            <div class="form-group">
                                <label for="emPhone">Phone Number</label>
                                <input type="text" id="emPhone" placeholder="e.g. 0712345678" required style="width:100%;background:#fff;border:1.5px solid #cbd5e1;padding:0.7rem 1rem;border-radius:10px;font-family:inherit;font-size:0.9rem;" />
                            </div>
                            <div class="form-group">
                                <label for="emRef">External Reference</label>
                                <input type="text" id="emRef" required style="width:100%;background:#fff;border:1.5px solid #cbd5e1;padding:0.7rem 1rem;border-radius:10px;font-family:inherit;font-size:0.9rem;" />
                            </div>
                            <div class="form-group">
                                <label for="emName">Customer Name <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label>
                                <input type="text" id="emName" placeholder="e.g. John Doe" style="width:100%;background:#fff;border:1.5px solid #cbd5e1;padding:0.7rem 1rem;border-radius:10px;font-family:inherit;font-size:0.9rem;" />
                            </div>
                            <button type="submit" class="btn btn-primary" id="emSubmitBtn" style="width:100%;margin-top:0.5rem;">
                                <i class="fa-solid fa-paper-plane"></i>
                                <span id="emSubmitText">Send Test Payment</span>
                            </button>
                        </form>
                    </div>
                </div>

                {{-- RIGHT: Transaction Queue --}}
                <div class="card" style="padding:1.5rem;">
                    <div class="card-title" style="justify-content:space-between;">
                        <span><i class="fa-solid fa-list-check"></i> Transaction Queue</span>
                        <button class="btn btn-secondary" style="padding:0.4rem 0.9rem;font-size:0.82rem;" onclick="emLoadTransactions()">
                            <i class="fa-solid fa-rotate-right"></i> Refresh
                        </button>
                    </div>

                    {{-- Stats --}}
                    <div class="em-stats">
                        <div class="em-stat"><div class="em-stat-val pending"  id="em-stat-pending">—</div><div class="em-stat-lbl">Pending</div></div>
                        <div class="em-stat"><div class="em-stat-val approved" id="em-stat-approved">—</div><div class="em-stat-lbl">Approved</div></div>
                        <div class="em-stat"><div class="em-stat-val rejected" id="em-stat-rejected">—</div><div class="em-stat-lbl">Rejected</div></div>
                        <div class="em-stat"><div class="em-stat-val total"    id="em-stat-total">—</div><div class="em-stat-lbl">Total</div></div>
                    </div>

                    {{-- Filter bar --}}
                    <div class="em-filter-bar">
                        <button class="em-filter-btn active" onclick="emSetFilter('all',this)">All</button>
                        <button class="em-filter-btn" onclick="emSetFilter('pending',this)">⏳ Pending</button>
                        <button class="em-filter-btn" onclick="emSetFilter('approved',this)">✅ Approved</button>
                        <button class="em-filter-btn" onclick="emSetFilter('rejected',this)">❌ Rejected</button>
                        <button class="em-filter-btn" onclick="emSetFilter('selcom',this)">Selcom</button>
                        <button class="em-filter-btn" onclick="emSetFilter('azampay',this)">AzamPay</button>
                        <div class="em-filter-spacer"></div>
                        <label class="em-auto-label">
                            Auto
                            <button class="em-toggle on" id="emAutoToggle" onclick="emToggleAuto()">
                                <div class="em-toggle-thumb"></div>
                            </button>
                        </label>
                    </div>

                    {{-- Transaction List --}}
                    <div class="em-tx-list" id="emTxList">
                        <div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.9rem;">Loading…</div>
                    </div>
                </div>

            </div>
        </div>{{-- /panel-emulator --}}

    <!-- Log Details Modal -->
    <div id="logDetailsModal" class="modal-overlay" onclick="if(event.target===this) closeLogModal()">
        <div class="modal-card">
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-solid fa-receipt" style="color: var(--primary);"></i> Transaction Log Details
                </div>
                <button class="modal-close" onclick="closeLogModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" id="logModalBody">
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading details...</div>
            </div>
        </div>
    </div>

    </div>{{-- /container --}}

    <script>
        /* ─── Config Tab ─────────────────────────────────────── */
        function selectGateway(gateway) {
            document.querySelectorAll('.gateway-option').forEach(el => el.classList.remove('selected'));
            document.getElementById('active_gateway').value = gateway;
            event.currentTarget.classList.add('selected');
            updateSectionOpacity(gateway);
        }
        function updateSectionOpacity(active) {
            ['selcom', 'azampay'].forEach(s => {
                document.getElementById('section_' + s).classList.toggle('disabled', s !== active);
            });
        }
        updateSectionOpacity('{{ $configs['active_gateway'] ?? 'selcom' }}');

        /* ─── Tab Switching ─────────────────────────────────── */
        function switchTab(tab) {
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('panel-' + tab).classList.add('active');
            document.getElementById('tab-' + tab + '-btn').classList.add('active');
            if (tab === 'emulator') emLoadTransactions();
        }
        // Open emulator tab if URL hash says so
        if (window.location.hash === '#emulator') switchTab('emulator');

        /* ─── Quick-fill emulator URLs into config form ──── */
        function fillEmulatorUrls() {
            const base = '{{ url('/api/emulator') }}';
            document.getElementById('azampay_base_url').value      = base + '/azampay';
            document.getElementById('azampay_auth_base_url').value = base + '/azampay';
            document.getElementById('selcom_base_url').value       = base + '/selcom';
            switchTab('config');
            showFlash('Emulator URLs filled in the Config tab. Click Save Configurations to apply.');
        }

        function showFlash(msg) {
            let el = document.getElementById('flash-msg');
            if (!el) {
                el = document.createElement('div');
                el.id = 'flash-msg';
                el.className = 'alert alert-success';
                el.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;max-width:380px;animation:slideIn 0.3s ease;';
                document.body.appendChild(el);
            }
            el.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + msg;
            el.style.display = 'flex';
            clearTimeout(el._t);
            el._t = setTimeout(() => el.style.display = 'none', 4000);
        }

        /* ─── Emulator Gateway Select ────────────────────── */
        function emSelectGateway(gw) {
            document.getElementById('emGateway').value = gw;
            document.getElementById('em-tab-selcom').className  = 'em-gw-tab' + (gw === 'selcom'  ? ' active-selcom'  : '');
            document.getElementById('em-tab-azampay').className = 'em-gw-tab' + (gw === 'azampay' ? ' active-azampay' : '');
        }

        /* ─── Emulator: Initiate Payment ────────────────── */
        async function emInitiatePayment(e) {
            e.preventDefault();
            const btn  = document.getElementById('emSubmitBtn');
            const text = document.getElementById('emSubmitText');
            btn.disabled = true;
            text.textContent = 'Sending…';

            const payload = {
                gateway:            document.getElementById('emGateway').value,
                amount:             document.getElementById('emAmount').value,
                phone:              document.getElementById('emPhone').value,
                external_reference: document.getElementById('emRef').value,
                name:               document.getElementById('emName').value || undefined,
            };
            Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

            try {
                const res  = await fetch('/api/v1/payments/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.success) {
                    showFlash('✅ Payment initiated! See it in the queue →');
                    if (payload.gateway === 'selcom' && data.payment_url) {
                        window.open(data.payment_url, '_blank');
                    }
                    document.getElementById('emRef').value = 'ORDER-' + Date.now();
                    await emLoadTransactions();
                } else {
                    alert('❌ ' + (data.message || 'Initiation failed.'));
                }
            } catch (err) {
                alert('Network error: ' + err.message);
            } finally {
                btn.disabled = false;
                text.textContent = 'Send Test Payment';
            }
        }

        /* ─── Emulator: Load Transactions ───────────────── */
        let emAllTx    = [];
        let emFilter   = 'all';
        let emAutoOn   = true;
        let emTimer    = null;
        const EM_POLL  = 3000;

        async function emLoadTransactions() {
            try {
                const res = await fetch('/api/emulator/transactions', { headers: { 'Accept': 'application/json' } });
                emAllTx = await res.json();
                emRender();
                emUpdateStats();
            } catch(e) { console.error(e); }
        }

        function emRender() {
            const list = document.getElementById('emTxList');
            let txs    = emAllTx;
            if (['pending','approved','rejected','timeout'].includes(emFilter)) {
                txs = txs.filter(t => t.status === emFilter);
            } else if (['selcom','azampay'].includes(emFilter)) {
                txs = txs.filter(t => t.gateway === emFilter);
            }
            if (!txs.length) {
                list.innerHTML = `<div class="em-empty"><div class="em-empty-icon">🔇</div><div style="font-weight:600;">No transactions yet</div><div style="font-size:0.82rem;margin-top:4px;">Initiate a test payment to see it here.</div></div>`;
                return;
            }
            list.innerHTML = txs.map(tx => {
                const fmt  = n => Number(n).toLocaleString('en-TZ');
                const ago  = emTimeAgo(tx.created_at);
                const pend = tx.status === 'pending';
                const statL = {pending:'⏳ Pending',approved:'✅ Approved',rejected:'❌ Rejected',timeout:'⏱ Timeout'};
                return `<div class="em-tx-card gw-${tx.gateway}">
                    <div class="em-tx-top">
                        <span class="em-gw-pill ${tx.gateway}">${tx.gateway.toUpperCase()}</span>
                        <span class="em-status-pill ${tx.status}">${statL[tx.status] || tx.status}</span>
                    </div>
                    <div class="em-tx-details">
                        <div><div class="em-tx-lbl">Amount</div><div class="em-tx-val">TZS ${fmt(tx.amount)}</div></div>
                        <div><div class="em-tx-lbl">Phone</div><div class="em-tx-val">${tx.phone}</div></div>
                        <div><div class="em-tx-lbl">Reference</div><div class="em-tx-val" style="font-size:0.72rem;">${tx.external_id}</div></div>
                        <div><div class="em-tx-lbl">Created</div><div class="em-tx-val" style="color:var(--text-muted);font-size:0.72rem;">${ago}</div></div>
                        ${tx.buyer_name ? `<div><div class="em-tx-lbl">Customer</div><div class="em-tx-val" style="font-size:0.75rem;">${tx.buyer_name}</div></div>` : ''}
                    </div>
                    ${pend ? `<div class="em-tx-actions">
                        <button class="em-act approve" onclick="emResolve(${tx.id},'approve')" id="em-approve-${tx.id}">✅ Approve</button>
                        <button class="em-act reject"  onclick="emResolve(${tx.id},'reject')"  id="em-reject-${tx.id}">❌ Reject</button>
                        <button class="em-act timeout" onclick="emResolve(${tx.id},'timeout')" id="em-timeout-${tx.id}">⏱ Timeout</button>
                    </div>` : ''}
                </div>`;
            }).join('');
        }

        async function emResolve(id, action) {
            ['approve','reject','timeout'].forEach(a => {
                const el = document.getElementById('em-'+a+'-'+id);
                if (el) { el.disabled = true; el.style.opacity = '0.5'; }
            });
            try {
                const res  = await fetch('/api/emulator/resolve/' + id, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ action }),
                });
                const data = await res.json();
                if (data.success) {
                    const labels = { approve:'✅ Approved', reject:'❌ Rejected', timeout:'⏱ Timed out' };
                    showFlash(labels[action] + ' — callback fired to your app!');
                    await emLoadTransactions();
                } else {
                    alert(data.error || 'Failed.');
                }
            } catch(err) { alert(err.message); }
        }

        function emUpdateStats() {
            const c = { pending:0, approved:0, rejected:0 };
            emAllTx.forEach(t => { if (c[t.status] !== undefined) c[t.status]++; });
            document.getElementById('em-stat-pending').textContent  = c.pending;
            document.getElementById('em-stat-approved').textContent = c.approved;
            document.getElementById('em-stat-rejected').textContent = c.rejected;
            document.getElementById('em-stat-total').textContent    = emAllTx.length;
            // Badge on tab
            const badge = document.getElementById('em-pending-badge');
            if (c.pending > 0) { badge.textContent = c.pending; badge.style.display = 'inline-block'; }
            else { badge.style.display = 'none'; }
        }

        function emSetFilter(f, el) {
            emFilter = f;
            document.querySelectorAll('.em-filter-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
            emRender();
        }

        function emToggleAuto() {
            emAutoOn = !emAutoOn;
            document.getElementById('emAutoToggle').classList.toggle('on', emAutoOn);
            if (emAutoOn) emStartPoll(); else clearTimeout(emTimer);
        }
        function emStartPoll() {
            clearTimeout(emTimer);
            if (emAutoOn) emTimer = setTimeout(async () => { await emLoadTransactions(); emStartPoll(); }, EM_POLL);
        }
        function emTimeAgo(d) {
            const s = Math.floor((Date.now() - new Date(d)) / 1000);
            if (s < 60) return s + 's ago';
            if (s < 3600) return Math.floor(s/60) + 'm ago';
            return Math.floor(s/3600) + 'h ago';
        }

        /* ─── Transaction Logs Management JS ───────────────── */
        let logCurrentPage = 1;
        let logDebounceTimer = null;

        function debounceLogSearch() {
            clearTimeout(logDebounceTimer);
            logDebounceTimer = setTimeout(() => loadLogs(1), 300);
        }

        async function loadLogs(page = 1) {
            logCurrentPage = page;
            const searchInput = document.getElementById('logSearchInput');
            const search = searchInput ? searchInput.value : '';
            const gatewaySelect = document.getElementById('logGatewayFilter');
            const gateway = gatewaySelect ? gatewaySelect.value : 'all';
            const statusSelect = document.getElementById('logStatusFilter');
            const status = statusSelect ? statusSelect.value : 'all';
            const perPageSelect = document.getElementById('logPerPage');
            const perPage = perPageSelect ? perPageSelect.value : '10';

            const tbody = document.getElementById('logsTableBody');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading transaction logs...</td></tr>';

            try {
                const url = `/logs?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}&gateway=${gateway}&status=${status}`;
                const res = await fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                const data = await res.json();
                renderLogsTable(data);
            } catch (e) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--danger);">Error loading logs: ${e.message}</td></tr>`;
            }
        }

        function renderLogsTable(data) {
            const tbody = document.getElementById('logsTableBody');
            const logs = data.data || [];

            const selectAll = document.getElementById('selectAllLogs');
            if (selectAll) selectAll.checked = false;
            updateBulkButtons();

            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No transaction logs found.</td></tr>';
                document.getElementById('paginationInfo').textContent = 'Showing 0 to 0 of 0 logs';
                document.getElementById('paginationLinks').innerHTML = '';
                return;
            }

            tbody.innerHTML = logs.map(log => {
                const dateStr = log.created_at ? new Date(log.created_at).toLocaleString('sv-SE').replace('T', ' ').substring(0, 16) : '-';
                const isFailed = log.status === 'failed';
                const badgeClass = log.status === 'success' ? 'badge-success' : (log.status === 'failed' ? 'badge-danger' : 'badge-pending');
                const statusLabel = log.status ? (log.status.charAt(0).toUpperCase() + log.status.slice(1)) : 'Pending';
                const amountFmt = Number(log.amount || 0).toLocaleString('en-TZ');

                return `
                    <tr>
                        <td style="text-align: center;">
                            <input type="checkbox" class="log-checkbox" value="${log.id}" data-status="${log.status}" onchange="updateBulkButtons()">
                        </td>
                        <td>${dateStr}</td>
                        <td><span style="font-family: monospace; font-size: 0.85rem; color: #475569;">${log.external_reference || '-'}</span></td>
                        <td><strong style="color: #334155;">${(log.gateway || '').toUpperCase()}</strong></td>
                        <td>${log.phone || '-'}</td>
                        <td>${amountFmt} TZS</td>
                        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                        <td style="text-align: right;">
                            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                                <button class="log-action-btn details" title="View Full Payload Details" onclick="openLogModal(${log.id})">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                ${isFailed ? `
                                <button class="log-action-btn retry" id="retry-btn-${log.id}" title="Retry Transaction" onclick="retryLog(${log.id})">
                                    <i class="fa-solid fa-rotate-right"></i>
                                </button>` : ''}
                                <button class="log-action-btn delete" title="Delete Log" onclick="deleteLog(${log.id})">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Pagination info
            const from = data.from || 0;
            const to = data.to || 0;
            const total = data.total || 0;
            document.getElementById('paginationInfo').textContent = `Showing ${from} to ${to} of ${total} logs`;

            renderPaginationNav(data);
        }

        function renderPaginationNav(data) {
            const nav = document.getElementById('paginationLinks');
            if (!nav) return;
            let html = '';

            const currentPage = data.current_page || 1;
            const lastPage = data.last_page || 1;

            html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="loadLogs(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;

            for (let p = 1; p <= lastPage; p++) {
                if (p === 1 || p === lastPage || (p >= currentPage - 2 && p <= currentPage + 2)) {
                    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="loadLogs(${p})">${p}</button>`;
                } else if (p === currentPage - 3 || p === currentPage + 3) {
                    html += `<span style="padding:0 4px; color:var(--text-muted);">...</span>`;
                }
            }

            html += `<button class="page-btn" ${currentPage >= lastPage ? 'disabled' : ''} onclick="loadLogs(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;

            nav.innerHTML = html;
        }

        function toggleSelectAllLogs(master) {
            document.querySelectorAll('.log-checkbox').forEach(cb => cb.checked = master.checked);
            updateBulkButtons();
        }

        function updateBulkButtons() {
            const checkboxes = Array.from(document.querySelectorAll('.log-checkbox'));
            const checked = checkboxes.filter(cb => cb.checked);
            const checkedFailed = checked.filter(cb => cb.dataset.status === 'failed');

            const btnDelete = document.getElementById('btnBulkDelete');
            const btnRetry = document.getElementById('btnBulkRetry');
            const selCount = document.getElementById('selectedCount');
            const selFailedCount = document.getElementById('selectedFailedCount');

            if (selCount) selCount.textContent = checked.length;
            if (selFailedCount) selFailedCount.textContent = checkedFailed.length;

            if (btnDelete) {
                btnDelete.disabled = checked.length === 0;
                btnDelete.style.opacity = checked.length > 0 ? '1' : '0.5';
            }

            if (btnRetry) {
                btnRetry.disabled = checkedFailed.length === 0;
                btnRetry.style.opacity = checkedFailed.length > 0 ? '1' : '0.5';
            }
        }

        async function deleteLog(id) {
            if (!confirm('Are you sure you want to delete this transaction log?')) return;
            try {
                const res = await fetch(`/logs/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    showFlash(data.message);
                    loadLogs(logCurrentPage);
                } else {
                    alert(data.message || 'Failed to delete log.');
                }
            } catch (e) { alert(e.message); }
        }

        async function retryLog(id) {
            const btn = document.getElementById(`retry-btn-${id}`);
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
            try {
                const res = await fetch(`/logs/retry/${id}`, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    showFlash('✅ ' + data.message);
                    loadLogs(logCurrentPage);
                } else {
                    alert('❌ ' + (data.message || 'Retry failed.'));
                    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>'; }
                }
            } catch (e) {
                alert('Error retrying transaction: ' + e.message);
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>'; }
            }
        }

        async function bulkDeleteSelected() {
            const checked = Array.from(document.querySelectorAll('.log-checkbox:checked')).map(cb => parseInt(cb.value));
            if (checked.length === 0) return;

            if (!confirm(`Are you sure you want to delete ${checked.length} selected transaction log(s)?`)) return;

            try {
                const res = await fetch('/logs/bulk-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json' },
                    body: JSON.stringify({ ids: checked })
                });
                const data = await res.json();
                if (data.success) {
                    showFlash(data.message);
                    loadLogs(logCurrentPage);
                } else {
                    alert(data.message || 'Bulk delete failed.');
                }
            } catch (e) { alert(e.message); }
        }

        async function bulkRetrySelected() {
            const checkedFailed = Array.from(document.querySelectorAll('.log-checkbox:checked'))
                .filter(cb => cb.dataset.status === 'failed')
                .map(cb => parseInt(cb.value));

            if (checkedFailed.length === 0) return;

            if (!confirm(`Are you sure you want to retry ${checkedFailed.length} failed transaction(s)?`)) return;

            try {
                const res = await fetch('/logs/bulk-retry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json' },
                    body: JSON.stringify({ ids: checkedFailed })
                });
                const data = await res.json();
                if (data.success) {
                    showFlash('✅ ' + data.message);
                    loadLogs(logCurrentPage);
                } else {
                    alert(data.message || 'Bulk retry failed.');
                }
            } catch (e) { alert(e.message); }
        }

        async function clearAllLogs() {
            if (!confirm('⚠️ CAUTION: Are you sure you want to delete ALL transaction logs? This action cannot be undone!')) return;

            try {
                const res = await fetch('/logs/bulk-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json' },
                    body: JSON.stringify({ type: 'all' })
                });
                const data = await res.json();
                if (data.success) {
                    showFlash(data.message);
                    loadLogs(1);
                } else {
                    alert(data.message || 'Clear all logs failed.');
                }
            } catch (e) { alert(e.message); }
        }

        async function openLogModal(id) {
            const modal = document.getElementById('logDetailsModal');
            const modalBody = document.getElementById('logModalBody');
            modal.classList.add('active');
            modalBody.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading log details...</div>';

            try {
                const res = await fetch(`/logs/${id}`, { headers: { 'Accept': 'application/json' } });
                const log = await res.json();

                const formatJson = obj => obj ? JSON.stringify(obj, null, 2) : 'null';

                modalBody.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                        <div><strong>External Reference:</strong> <span style="font-family:monospace;">${log.external_reference || '-'}</span></div>
                        <div><strong>Gateway Reference:</strong> <span style="font-family:monospace;">${log.gateway_reference || '-'}</span></div>
                        <div><strong>Gateway:</strong> <strong style="color:var(--primary);">${(log.gateway||'').toUpperCase()}</strong></div>
                        <div><strong>Phone Number:</strong> ${log.phone || '-'}</div>
                        <div><strong>Amount:</strong> ${Number(log.amount || 0).toLocaleString('en-TZ')} TZS</div>
                        <div><strong>Status:</strong> <span class="badge badge-${log.status==='success'?'success':(log.status==='failed'?'danger':'pending')}">${log.status}</span></div>
                        <div><strong>Created At:</strong> ${log.created_at || '-'}</div>
                        <div><strong>Updated At:</strong> ${log.updated_at || '-'}</div>
                    </div>

                    <div style="margin-top: 1rem;">
                        <label style="font-weight: 700; color: #334155;">Raw Request Payload</label>
                        <div class="modal-code-block">${formatJson(log.raw_request)}</div>
                    </div>

                    <div style="margin-top: 1rem;">
                        <label style="font-weight: 700; color: #334155;">Gateway Raw Response</label>
                        <div class="modal-code-block">${formatJson(log.raw_response)}</div>
                    </div>

                    <div style="margin-top: 1rem;">
                        <label style="font-weight: 700; color: #334155;">Callback Payload</label>
                        <div class="modal-code-block">${formatJson(log.callback_payload)}</div>
                    </div>
                `;
            } catch (e) {
                modalBody.innerHTML = `<div style="color: var(--danger); padding: 1rem;">Error loading log details: ${e.message}</div>`;
            }
        }

        function closeLogModal() {
            document.getElementById('logDetailsModal').classList.remove('active');
        }

        function exportLogs(format) {
            const searchInput = document.getElementById('logSearchInput');
            const search = searchInput ? searchInput.value : '';
            const gatewaySelect = document.getElementById('logGatewayFilter');
            const gateway = gatewaySelect ? gatewaySelect.value : 'all';
            const statusSelect = document.getElementById('logStatusFilter');
            const status = statusSelect ? statusSelect.value : 'all';

            const url = `/logs/export?format=${format}&search=${encodeURIComponent(search)}&gateway=${gateway}&status=${status}`;
            window.open(url, '_blank');
        }

        // Pre-fill reference on load
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('emRef').value = 'ORDER-' + Date.now();
            emStartPoll();
            loadLogs(1);
        });
    </script>
</body>
</html>
