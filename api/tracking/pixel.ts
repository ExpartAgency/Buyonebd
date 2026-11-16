export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, active: true, endpoint: '/api/tracking/pixel' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const {
      eventName = 'PageView',
      urlPath = '/',
      sourceUrl = '',
      value,
      currency = 'BDT',
      contentName,
      pixelId = '',
      accessToken = '',
      testEventCode
    } = body;

    let status: 'sent_capi' | 'logged_server' = 'logged_server';
    let capiResponse: any = null;

    if (pixelId && accessToken) {
      try {
        const capiPayload: any = {
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: sourceUrl || urlPath,
              user_data: {
                client_ip_address: req.headers?.['x-forwarded-for'] || '0.0.0.0',
                client_user_agent: req.headers?.['user-agent'] || 'BuyOneBD'
              },
              custom_data: {
                currency,
                ...(value !== undefined ? { value: Number(value) } : {}),
                ...(contentName ? { content_name: contentName } : {}),
                url_path: urlPath
              }
            }
          ],
          ...(testEventCode ? { test_event_code: testEventCode } : {})
        };

        const fbRes = await fetch(
          `https://graph.facebook.com/v21.0/${encodeURIComponent(String(pixelId))}/events?access_token=${encodeURIComponent(String(accessToken))}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(capiPayload)
          }
        );
        capiResponse = await fbRes.json().catch(() => null);
        if (fbRes.ok) {
          status = 'sent_capi';
        }
      } catch {
        status = 'logged_server';
      }
    }

    const eventRecord = {
      id: `px-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName,
      urlPath,
      sourceUrl: sourceUrl || urlPath,
      pixelId: pixelId || undefined,
      value,
      currency,
      contentName,
      status,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({ success: true, event: eventRecord, capiResponse });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Pixel dispatch error' });
  }
}
