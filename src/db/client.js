/**
 * Database client for Cloudflare D1
 */

export class DbClient {
  constructor(db) {
    this.db = db;
  }

  // --- CONFIG HELPER METHODS ---

  async getConfig(key, defaultValue = '') {
    try {
      const row = await this.db
        .prepare('SELECT value FROM configs WHERE key = ?')
        .bind(key)
        .first();
      return row ? (row.value ?? defaultValue) : defaultValue;
    } catch (e) {
      console.error(`Error getting config ${key}:`, e);
      return defaultValue;
    }
  }

  async setConfig(key, value) {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT INTO configs (key, value, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .bind(key, value, now, now)
      .run();
  }

  async getGatewayConfig(gateway, key, targetEnv = null) {
    const env = targetEnv || (await this.getConfig('environment_mode', 'sandbox'));
    const envKey = `${env}_${gateway}_${key}`;
    const envVal = await this.getConfig(envKey);
    if (envVal !== null && envVal !== undefined && envVal !== '') {
      return envVal;
    }
    // Fallback to legacy non-prefixed key e.g. 'azampay_base_url'
    const fallbackKey = `${gateway}_${key}`;
    return await this.getConfig(fallbackKey, '');
  }

  async getAllConfigs() {
    const keys = [
      'environment_mode',
      'active_gateway',
      'webapp_callback_url',
      // Legacy keys
      'selcom_base_url',
      'selcom_api_key',
      'selcom_secret_key',
      'selcom_vendor',
      'azampay_base_url',
      'azampay_auth_base_url',
      'azampay_client_id',
      'azampay_client_secret',
      'azampay_app_name',
      'azampay_api_key',
      // Live Keys
      'live_selcom_base_url',
      'live_selcom_api_key',
      'live_selcom_secret_key',
      'live_selcom_vendor',
      'live_azampay_base_url',
      'live_azampay_auth_base_url',
      'live_azampay_client_id',
      'live_azampay_client_secret',
      'live_azampay_app_name',
      'live_azampay_api_key',
      // Sandbox Keys
      'sandbox_selcom_base_url',
      'sandbox_selcom_api_key',
      'sandbox_selcom_secret_key',
      'sandbox_selcom_vendor',
      'sandbox_azampay_base_url',
      'sandbox_azampay_auth_base_url',
      'sandbox_azampay_client_id',
      'sandbox_azampay_client_secret',
      'sandbox_azampay_app_name',
      'sandbox_azampay_api_key',
    ];

    const result = await this.db.prepare('SELECT key, value FROM configs').all();
    const map = {};
    for (const k of keys) {
      map[k] = '';
    }
    if (result.results) {
      for (const row of result.results) {
        map[row.key] = row.value;
      }
    }
    return map;
  }

  // --- PAYMENT LOG HELPER METHODS ---

  async createPaymentLog(logData) {
    const now = new Date().toISOString();
    const res = await this.db
      .prepare(
        `INSERT INTO payment_logs (external_reference, gateway_reference, gateway, amount, phone, status, raw_request, raw_response, callback_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        logData.external_reference,
        logData.gateway_reference || null,
        logData.gateway,
        logData.amount,
        logData.phone,
        logData.status || 'pending',
        logData.raw_request ? JSON.stringify(logData.raw_request) : null,
        logData.raw_response ? JSON.stringify(logData.raw_response) : null,
        logData.callback_payload ? JSON.stringify(logData.callback_payload) : null,
        now,
        now
      )
      .run();

    return res.meta.last_row_id;
  }

  async updatePaymentLog(id, updateData) {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updateData.gateway_reference !== undefined) {
      fields.push('gateway_reference = ?');
      values.push(updateData.gateway_reference);
    }
    if (updateData.status !== undefined) {
      fields.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.raw_response !== undefined) {
      fields.push('raw_response = ?');
      values.push(updateData.raw_response ? JSON.stringify(updateData.raw_response) : null);
    }
    if (updateData.callback_payload !== undefined) {
      fields.push('callback_payload = ?');
      values.push(updateData.callback_payload ? JSON.stringify(updateData.callback_payload) : null);
    }

    fields.push('updated_at = ?');
    values.push(now);

    values.push(id);

    await this.db
      .prepare(`UPDATE payment_logs SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async findPaymentLogByRef(externalReference, gateway = null) {
    let sql = 'SELECT * FROM payment_logs WHERE external_reference = ?';
    const params = [externalReference];

    if (gateway) {
      sql += ' AND gateway = ?';
      params.push(gateway);
    }

    sql += ' ORDER BY id DESC LIMIT 1';

    const row = await this.db.prepare(sql).bind(...params).first();
    return this.parseLogItem(row);
  }

  async findPaymentLogById(id) {
    const row = await this.db
      .prepare('SELECT * FROM payment_logs WHERE id = ?')
      .bind(id)
      .first();
    return this.parseLogItem(row);
  }

  async getPaymentLogs({ search = '', gateway = '', status = '', page = 1, perPage = 10 }) {
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(external_reference LIKE ? OR phone LIKE ? OR gateway_reference LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (gateway && gateway !== 'all') {
      whereClauses.push('gateway = ?');
      params.push(gateway.toLowerCase());
    }

    if (status && status !== 'all') {
      whereClauses.push('status = ?');
      params.push(status.toLowerCase());
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count query
    const countRow = await this.db
      .prepare(`SELECT COUNT(*) as total FROM payment_logs ${whereSql}`)
      .bind(...params)
      .first();

    const total = countRow ? countRow.total : 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;

    // Data query
    const dataSql = `SELECT * FROM payment_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataResult = await this.db
      .prepare(dataSql)
      .bind(...params, perPage, offset)
      .all();

    const data = (dataResult.results || []).map((row) => this.parseLogItem(row));

    return {
      current_page: page,
      data,
      first_page_url: `?page=1`,
      from: total > 0 ? offset + 1 : null,
      last_page: lastPage,
      last_page_url: `?page=${lastPage}`,
      next_page_url: page < lastPage ? `?page=${page + 1}` : null,
      prev_page_url: page > 1 ? `?page=${page - 1}` : null,
      per_page: perPage,
      to: total > 0 ? Math.min(offset + perPage, total) : null,
      total,
    };
  }

  async deletePaymentLog(id) {
    await this.db.prepare('DELETE FROM payment_logs WHERE id = ?').bind(id).run();
  }

  async bulkDeletePaymentLogs({ type, ids = [] }) {
    if (type === 'all') {
      const res = await this.db.prepare('DELETE FROM payment_logs').run();
      return res.meta.changes || 0;
    } else {
      if (!ids || ids.length === 0) return 0;
      const placeholders = ids.map(() => '?').join(',');
      const res = await this.db
        .prepare(`DELETE FROM payment_logs WHERE id IN (${placeholders})`)
        .bind(...ids)
        .run();
      return res.meta.changes || 0;
    }
  }

  async getAllPaymentLogsFiltered({ search = '', gateway = '', status = '' }) {
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(external_reference LIKE ? OR phone LIKE ? OR gateway_reference LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (gateway && gateway !== 'all') {
      whereClauses.push('gateway = ?');
      params.push(gateway.toLowerCase());
    }

    if (status && status !== 'all') {
      whereClauses.push('status = ?');
      params.push(status.toLowerCase());
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const res = await this.db
      .prepare(`SELECT * FROM payment_logs ${whereSql} ORDER BY created_at DESC`)
      .bind(...params)
      .all();

    return (res.results || []).map((row) => this.parseLogItem(row));
  }

  parseLogItem(row) {
    if (!row) return null;
    return {
      ...row,
      raw_request: row.raw_request ? JSON.parse(row.raw_request) : null,
      raw_response: row.raw_response ? JSON.parse(row.raw_response) : null,
      callback_payload: row.callback_payload ? JSON.parse(row.callback_payload) : null,
    };
  }

  // --- EMULATOR HELPER METHODS ---

  async createEmulatorTxn(txnData) {
    const now = new Date().toISOString();
    const res = await this.db
      .prepare(
        `INSERT INTO emulator_transactions (gateway, external_id, amount, phone, buyer_name, buyer_email, status, raw_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        txnData.gateway,
        txnData.external_id,
        txnData.amount,
        txnData.phone,
        txnData.buyer_name || null,
        txnData.buyer_email || null,
        txnData.status || 'pending',
        txnData.raw_payload ? JSON.stringify(txnData.raw_payload) : null,
        now,
        now
      )
      .run();

    return res.meta.last_row_id;
  }

  async getEmulatorTxns(limit = 50) {
    const res = await this.db
      .prepare('SELECT * FROM emulator_transactions ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all();

    return (res.results || []).map((row) => ({
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
    }));
  }

  async findEmulatorTxnById(id) {
    const row = await this.db
      .prepare('SELECT * FROM emulator_transactions WHERE id = ?')
      .bind(id)
      .first();

    if (!row) return null;
    return {
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
    };
  }

  async findEmulatorTxnByExtId(externalId, gateway = 'selcom') {
    const row = await this.db
      .prepare('SELECT * FROM emulator_transactions WHERE external_id = ? AND gateway = ? ORDER BY id DESC LIMIT 1')
      .bind(externalId, gateway)
      .first();

    if (!row) return null;
    return {
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
    };
  }

  async updateEmulatorTxn(id, updateData) {
    const now = new Date().toISOString();
    await this.db
      .prepare('UPDATE emulator_transactions SET status = ?, updated_at = ? WHERE id = ?')
      .bind(updateData.status, now, id)
      .run();
  }

  // --- HTTP REQUEST / RESPONSE LOG HELPER METHODS ---

  async createRequestLog(logData) {
    const now = new Date().toISOString();
    const requestId = logData.request_id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    try {
      const res = await this.db
        .prepare(
          `INSERT INTO request_logs 
           (request_id, direction, method, path, status_code, headers, request_body, response_body, ip_address, duration_ms, external_reference, gateway, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          requestId,
          logData.direction || 'INBOUND',
          logData.method || 'GET',
          logData.path || '/',
          logData.status_code || null,
          logData.headers ? (typeof logData.headers === 'string' ? logData.headers : JSON.stringify(logData.headers)) : null,
          logData.request_body ? (typeof logData.request_body === 'string' ? logData.request_body : JSON.stringify(logData.request_body)) : null,
          logData.response_body ? (typeof logData.response_body === 'string' ? logData.response_body : JSON.stringify(logData.response_body)) : null,
          logData.ip_address || null,
          logData.duration_ms || 0,
          logData.external_reference || null,
          logData.gateway || null,
          now
        )
        .run();
      return res.meta?.last_row_id || null;
    } catch (e) {
      console.error('Error creating request log:', e);
      return null;
    }
  }

  async getRequestLogs({ search = '', direction = '', status = '', method = '', page = 1, perPage = 15 }) {
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(path LIKE ? OR external_reference LIKE ? OR request_body LIKE ? OR response_body LIKE ? OR request_id LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (direction && direction !== 'all') {
      whereClauses.push('direction = ?');
      params.push(direction.toUpperCase());
    }

    if (method && method !== 'all') {
      whereClauses.push('method = ?');
      params.push(method.toUpperCase());
    }

    if (status && status !== 'all') {
      if (status === '2xx') {
        whereClauses.push('status_code >= 200 AND status_code < 300');
      } else if (status === '4xx') {
        whereClauses.push('status_code >= 400 AND status_code < 500');
      } else if (status === '5xx') {
        whereClauses.push('status_code >= 500');
      } else if (!isNaN(status)) {
        whereClauses.push('status_code = ?');
        params.push(parseInt(status, 10));
      }
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count query
    const countRow = await this.db
      .prepare(`SELECT COUNT(*) as total FROM request_logs ${whereSql}`)
      .bind(...params)
      .first();

    const total = countRow ? countRow.total : 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;

    // Data query
    const dataSql = `SELECT * FROM request_logs ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const dataResult = await this.db
      .prepare(dataSql)
      .bind(...params, perPage, offset)
      .all();

    const data = (dataResult.results || []).map((row) => this.parseRequestLogItem(row));

    return {
      current_page: page,
      data,
      first_page_url: `?page=1`,
      from: total > 0 ? offset + 1 : null,
      last_page: lastPage,
      last_page_url: `?page=${lastPage}`,
      next_page_url: page < lastPage ? `?page=${page + 1}` : null,
      prev_page_url: page > 1 ? `?page=${page - 1}` : null,
      per_page: perPage,
      to: total > 0 ? Math.min(offset + perPage, total) : null,
      total,
    };
  }

  async findRequestLogById(id) {
    const row = await this.db
      .prepare('SELECT * FROM request_logs WHERE id = ?')
      .bind(id)
      .first();
    return this.parseRequestLogItem(row);
  }

  async deleteRequestLog(id) {
    await this.db.prepare('DELETE FROM request_logs WHERE id = ?').bind(id).run();
  }

  async bulkDeleteRequestLogs({ type, ids = [] }) {
    if (type === 'all') {
      const res = await this.db.prepare('DELETE FROM request_logs').run();
      return res.meta?.changes || 0;
    } else {
      if (!ids || ids.length === 0) return 0;
      const placeholders = ids.map(() => '?').join(',');
      const res = await this.db
        .prepare(`DELETE FROM request_logs WHERE id IN (${placeholders})`)
        .bind(...ids)
        .run();
      return res.meta?.changes || 0;
    }
  }

  parseRequestLogItem(row) {
    if (!row) return null;
    let headersObj = null;
    let reqBodyObj = null;
    let resBodyObj = null;

    try {
      headersObj = row.headers ? JSON.parse(row.headers) : null;
    } catch (e) {
      headersObj = row.headers;
    }

    try {
      reqBodyObj = row.request_body ? JSON.parse(row.request_body) : null;
    } catch (e) {
      reqBodyObj = row.request_body;
    }

    try {
      resBodyObj = row.response_body ? JSON.parse(row.response_body) : null;
    } catch (e) {
      resBodyObj = row.response_body;
    }

    return {
      ...row,
      headers: headersObj,
      request_body: reqBodyObj,
      response_body: resBodyObj,
    };
  }
}
