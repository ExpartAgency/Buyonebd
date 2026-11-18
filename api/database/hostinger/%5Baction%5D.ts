import mysql from 'mysql2/promise';

function sanitizeSqlPrefix(raw?: string): string {
  const clean = String(raw || 'buyone_').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
  return clean || 'buyone_';
}

function resolveCfg(input: any) {
  const h = input || {};
  return {
    enabled: Boolean(h.enabled),
    mode: h.mode === 'php_bridge' ? ('php_bridge' as const) : ('mysql_direct' as const),
    host: String(h.host || process.env.HOSTINGER_DB_HOST || 'localhost').trim(),
    port: Number(h.port || process.env.HOSTINGER_DB_PORT || 3306) || 3306,
    database: String(h.database || process.env.HOSTINGER_DB_NAME || '').trim(),
    user: String(h.username || h.user || process.env.HOSTINGER_DB_USER || '').trim(),
    password: String(h.password || process.env.HOSTINGER_DB_PASS || ''),
    tablePrefix: sanitizeSqlPrefix(h.tablePrefix || process.env.HOSTINGER_DB_PREFIX),
    ssl: Boolean(h.ssl),
    phpBridgeUrl: String(h.phpBridgeUrl || '').trim(),
    phpBridgeSecret: String(h.phpBridgeSecret || '').trim()
  };
}

async function openConn(cfg: ReturnType<typeof resolveCfg>) {
  if (!cfg.host || !cfg.database || !cfg.user) {
    throw new Error('Hostinger MySQL Host, Database Name, and Username are required.');
  }
  if (cfg.host === 'localhost' || cfg.host === '127.0.0.1') {
    throw new Error(
      'Cannot reach localhost:3306 from cloud server. Enter your Hostinger Remote MySQL hostname (e.g. srvXXXX.hstgr.io) or use Shared Hosting PHP Bridge mode.'
    );
  }
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 5000
  });
}

async function ensureSchema(conn: mysql.Connection, p: string) {
  const tables = [`${p}store_kv`, `${p}orders`, `${p}products`, `${p}customers`];
  await conn.query(`CREATE TABLE IF NOT EXISTS \`${p}store_kv\` (\`kv_key\` VARCHAR(80) NOT NULL PRIMARY KEY, \`kv_value\` LONGTEXT NOT NULL, \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  await conn.query(`CREATE TABLE IF NOT EXISTS \`${p}orders\` (\`id\` VARCHAR(64) NOT NULL PRIMARY KEY, \`customer_name\` VARCHAR(160) NOT NULL, \`customer_phone\` VARCHAR(32) NOT NULL, \`district\` VARCHAR(120) DEFAULT '', \`total\` DECIMAL(12,2) DEFAULT 0, \`status\` VARCHAR(32) DEFAULT 'pending', \`source\` VARCHAR(16) DEFAULT 'online', \`payload_json\` LONGTEXT NOT NULL, \`created_at\` VARCHAR(64) DEFAULT '', \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  await conn.query(`CREATE TABLE IF NOT EXISTS \`${p}products\` (\`id\` VARCHAR(64) NOT NULL PRIMARY KEY, \`title\` VARCHAR(255) NOT NULL, \`category\` VARCHAR(120) DEFAULT '', \`price\` DECIMAL(12,2) DEFAULT 0, \`stock\` INT DEFAULT 0, \`barcode\` VARCHAR(120) DEFAULT '', \`payload_json\` LONGTEXT NOT NULL, \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  await conn.query(`CREATE TABLE IF NOT EXISTS \`${p}customers\` (\`phone\` VARCHAR(32) NOT NULL PRIMARY KEY, \`name\` VARCHAR(160) NOT NULL, \`email\` VARCHAR(160) DEFAULT '', \`wallet_balance\` DECIMAL(12,2) DEFAULT 0, \`loyalty_points\` INT DEFAULT 0, \`payload_json\` LONGTEXT NOT NULL, \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  return tables;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  const action = String(req.query?.action || '').trim();
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const cfg = resolveCfg(body.config);

  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'Hostinger PHP Bridge URL is required.' });
    }
    const actionMap: Record<string, string> = {
      test: 'ping',
      'init-schema': 'init_schema',
      'sync-push': 'sync_push',
      'sync-pull': 'sync_pull',
      order: 'upsert_order',
      orders: 'list_orders'
    };
    const bridgeAction = actionMap[action] || action;
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': cfg.phpBridgeSecret
        },
        body: JSON.stringify({
          action: bridgeAction,
          tablePrefix: cfg.tablePrefix,
          payload: body.payload,
          order: body.order
        })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        return res.status(400).json({ success: false, error: data?.error || `PHP Bridge HTTP ${resp.status}` });
      }
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'PHP Bridge unreachable' });
    }
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await openConn(cfg);
    const p = cfg.tablePrefix;

    if (action === 'test') {
      const [rows] = await conn.query('SELECT VERSION() AS version, DATABASE() AS dbName');
      const [tableRows] = await conn.query('SHOW TABLES');
      const info = Array.isArray(rows) && rows[0] ? (rows[0] as any) : {};
      const tables = Array.isArray(tableRows) ? tableRows.map((r: any) => Object.values(r)[0]) : [];
      return res.status(200).json({
        success: true,
        mode: 'mysql_direct',
        version: info.version || 'MySQL Connected',
        database: info.dbName || cfg.database,
        tables
      });
    }

    if (action === 'init-schema') {
      const tables = await ensureSchema(conn, p);
      return res.status(200).json({ success: true, tables });
    }

    if (action === 'sync-push') {
      await ensureSchema(conn, p);
      const payload = body.payload || {};
      const kvEntries: [string, any][] = [
        ['full_backup_json', payload],
        ['settings_json', payload.settings || {}],
        ['categories_json', payload.categories || []],
        ['sliders_json', payload.sliders || []],
        ['reviews_json', payload.reviews || []]
      ];
      for (const [k, v] of kvEntries) {
        await conn.query(
          `INSERT INTO \`${p}store_kv\` (kv_key, kv_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE kv_value = VALUES(kv_value)`,
          [k, JSON.stringify(v)]
        );
      }
      const ordersArr: any[] = Array.isArray(payload.orders) ? payload.orders : [];
      for (const ord of ordersArr) {
        if (!ord?.id) continue;
        await conn.query(
          `INSERT INTO \`${p}orders\` (id, customer_name, customer_phone, district, total, status, source, payload_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), customer_phone=VALUES(customer_phone), district=VALUES(district), total=VALUES(total), status=VALUES(status), payload_json=VALUES(payload_json)`,
          [
            String(ord.id),
            String(ord.customer?.name || 'Customer').slice(0, 160),
            String(ord.customer?.phone || '').slice(0, 32),
            String(ord.customer?.district || '').slice(0, 120),
            Number(ord.pricing?.total || 0),
            String(ord.status || 'pending').slice(0, 32),
            String(ord.source || 'online').slice(0, 16),
            JSON.stringify(ord),
            String(ord.createdAt || new Date().toISOString()).slice(0, 64)
          ]
        );
      }
      const prodsArr: any[] = Array.isArray(payload.products) ? payload.products : [];
      for (const prod of prodsArr) {
        if (!prod?.id) continue;
        await conn.query(
          `INSERT INTO \`${p}products\` (id, title, category, price, stock, barcode, payload_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), price=VALUES(price), stock=VALUES(stock), barcode=VALUES(barcode), payload_json=VALUES(payload_json)`,
          [
            String(prod.id),
            String(prod.title || 'Product').slice(0, 255),
            String(prod.category || '').slice(0, 120),
            Number(prod.price || 0),
            Number(prod.stock || 0),
            String(prod.barcode || prod.sku || '').slice(0, 120),
            JSON.stringify(prod)
          ]
        );
      }
      const custArr: any[] = Array.isArray(payload.customerAccounts) ? payload.customerAccounts : [];
      for (const cust of custArr) {
        if (!cust?.phone) continue;
        await conn.query(
          `INSERT INTO \`${p}customers\` (phone, name, email, wallet_balance, loyalty_points, payload_json)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), wallet_balance=VALUES(wallet_balance), loyalty_points=VALUES(loyalty_points), payload_json=VALUES(payload_json)`,
          [
            String(cust.phone).slice(0, 32),
            String(cust.name || 'Customer').slice(0, 160),
            String(cust.email || '').slice(0, 160),
            Number(cust.walletBalance || 0),
            Number(cust.loyaltyPoints || 0),
            JSON.stringify(cust)
          ]
        );
      }
      return res.status(200).json({
        success: true,
        counts: { orders: ordersArr.length, products: prodsArr.length, customers: custArr.length },
        syncedAt: new Date().toISOString()
      });
    }

    if (action === 'sync-pull') {
      await ensureSchema(conn, p);
      const [kvRows] = await conn.query(`SELECT kv_key, kv_value FROM \`${p}store_kv\``);
      let snapshot: any = {};
      if (Array.isArray(kvRows)) {
        const backupRow = (kvRows as any[]).find((r) => r.kv_key === 'full_backup_json');
        if (backupRow?.kv_value) snapshot = JSON.parse(backupRow.kv_value);
      }
      const [ordRows] = await conn.query(`SELECT payload_json FROM \`${p}orders\` ORDER BY updated_at DESC`);
      const [prodRows] = await conn.query(`SELECT payload_json FROM \`${p}products\``);
      const [custRows] = await conn.query(`SELECT payload_json FROM \`${p}customers\``);
      if (Array.isArray(ordRows) && ordRows.length > 0) snapshot.orders = (ordRows as any[]).map((r) => JSON.parse(r.payload_json));
      if (Array.isArray(prodRows) && prodRows.length > 0) snapshot.products = (prodRows as any[]).map((r) => JSON.parse(r.payload_json));
      if (Array.isArray(custRows) && custRows.length > 0) snapshot.customerAccounts = (custRows as any[]).map((r) => JSON.parse(r.payload_json));
      return res.status(200).json({ success: true, payload: snapshot });
    }

    if (action === 'order') {
      const ord = body.order;
      if (!ord?.id) return res.status(400).json({ success: false, error: 'Order payload required.' });
      await ensureSchema(conn, p);
      await conn.query(
        `INSERT INTO \`${p}orders\` (id, customer_name, customer_phone, district, total, status, source, payload_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), customer_phone=VALUES(customer_phone), district=VALUES(district), total=VALUES(total), status=VALUES(status), payload_json=VALUES(payload_json)`,
        [
          String(ord.id),
          String(ord.customer?.name || 'Customer').slice(0, 160),
          String(ord.customer?.phone || '').slice(0, 32),
          String(ord.customer?.district || '').slice(0, 120),
          Number(ord.pricing?.total || 0),
          String(ord.status || 'pending').slice(0, 32),
          String(ord.source || 'online').slice(0, 16),
          JSON.stringify(ord),
          String(ord.createdAt || new Date().toISOString()).slice(0, 64)
        ]
      );
      return res.status(200).json({ success: true, orderId: ord.id });
    }

    if (action === 'orders') {
      await ensureSchema(conn, p);
      const [ordRows] = await conn.query(`SELECT payload_json FROM \`${p}orders\` ORDER BY updated_at DESC LIMIT 200`);
      const orders = Array.isArray(ordRows) ? (ordRows as any[]).map((r) => JSON.parse(r.payload_json)) : [];
      return res.status(200).json({ success: true, orders });
    }

    return res.status(404).json({ success: false, error: `Unknown Hostinger DB action: ${action}` });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Hostinger DB error' });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}
