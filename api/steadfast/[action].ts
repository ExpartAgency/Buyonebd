export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const action = String(req.query?.action || '').trim();
    const apiKey = String(body.apiKey || process.env.STEADFAST_API_KEY || '').trim();
    const secretKey = String(body.secretKey || process.env.STEADFAST_SECRET_KEY || '').trim();
    const baseUrl = String(body.baseUrl || 'https://portal.steadfast.com.bd/api/v1')
      .trim()
      .replace(/\/+$/, '');

    if (!apiKey || !secretKey) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Steadfast API Key and Secret Key are required.'
      });
    }

    if (action === 'balance') {
      const resp = await fetch(`${baseUrl}/get_balance`, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json'
        }
      });
      const text = await resp.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
      if (!resp.ok || (parsed?.status && parsed.status !== 200)) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: parsed?.message || parsed?.error || `Steadfast API returned HTTP ${resp.status}`,
          details: parsed
        });
      }
      const balanceVal = parsed?.current_balance ?? parsed?.balance ?? 0;
      return res.status(200).json({
        ok: true,
        success: true,
        balance: balanceVal,
        current_balance: balanceVal,
        data: parsed
      });
    }

    if (action === 'create-order') {
      const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = body;
      if (!invoice || !recipient_name || !recipient_phone || !recipient_address) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: 'invoice, recipient_name, recipient_phone, recipient_address are required.'
        });
      }
      const cleanPhone = String(recipient_phone).replace(/[^0-9]/g, '').replace(/^880/, '0').slice(-11);
      const resp = await fetch(`${baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice: String(invoice),
          recipient_name: String(recipient_name),
          recipient_phone: cleanPhone,
          recipient_address: String(recipient_address),
          cod_amount: Math.max(0, Math.round(Number(cod_amount) || 0)),
          note: note ? String(note) : ''
        })
      });
      const text = await resp.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
      if (!resp.ok || (parsed?.status && parsed.status !== 200)) {
        const errDetail = parsed?.errors
          ? Object.values(parsed.errors).flat().join(', ')
          : parsed?.message || parsed?.error || `Steadfast HTTP ${resp.status}`;
        return res.status(400).json({ ok: false, success: false, error: errDetail, details: parsed });
      }
      const consignment = parsed?.consignment || parsed?.data || {};
      return res.status(200).json({
        ok: true,
        success: true,
        consignment_id: String(consignment.consignment_id || parsed?.consignment_id || ''),
        tracking_code: String(consignment.tracking_code || parsed?.tracking_code || ''),
        status: String(consignment.status || 'in_review'),
        data: parsed
      });
    }

    if (action === 'status') {
      const { consignmentId, invoice, trackingCode } = body;
      let endpoint = '';
      if (consignmentId && /^\d+$/.test(String(consignmentId).trim())) {
        endpoint = `${baseUrl}/status_by_cid/${encodeURIComponent(String(consignmentId).trim())}`;
      } else if (invoice) {
        endpoint = `${baseUrl}/status_by_invoice/${encodeURIComponent(String(invoice).trim())}`;
      } else if (trackingCode) {
        endpoint = `${baseUrl}/status_by_trackingcode/${encodeURIComponent(String(trackingCode).trim())}`;
      } else {
        return res.status(400).json({ ok: false, success: false, error: 'consignmentId or invoice is required.' });
      }
      const resp = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json'
        }
      });
      const text = await resp.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
      if (!resp.ok || (parsed?.status && parsed.status !== 200)) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: parsed?.message || parsed?.error || `Steadfast status HTTP ${resp.status}`,
          details: parsed
        });
      }
      return res.status(200).json({
        ok: true,
        success: true,
        delivery_status: parsed?.delivery_status || 'unknown',
        data: parsed
      });
    }

    return res.status(404).json({ ok: false, success: false, error: `Unknown Steadfast action: ${action}` });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      success: false,
      error: err?.message || 'Steadfast API proxy failed'
    });
  }
}
