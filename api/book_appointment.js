const DEFAULT_WHATSAPP_TO = '393347992295';

function buildMessage(data) {
  return [
    'Nuovo Appuntamento Prenotato!',
    `Nome: ${data.nome || 'N/D'}`,
    `Email: ${data.email || 'N/D'}`,
    `Telefono: ${data.telefono || 'N/D'}`,
    `Data: ${data.data || 'N/D'}`,
    `Slot: ${data.slot || 'N/D'}`,
    `Argomento: ${data.argomento || 'N/D'}`
  ].join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ status: 'error', error: 'Metodo non consentito' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = buildMessage(data);
    const toNumber = process.env.BOOKING_WHATSAPP_TO || DEFAULT_WHATSAPP_TO;
    const whatsappUrl = `https://wa.me/${toNumber}?text=${encodeURIComponent(message)}`;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.TWILIO_WHATSAPP_TO || `whatsapp:+${toNumber}`;

    if (!sid || !token || !from) {
      return res.status(200).json({ status: 'success', manual: true, whatsappUrl });
    }

    const body = new URLSearchParams({
      From: from,
      To: to,
      Body: message
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(502).json({ status: 'error', error: result.message || 'Errore invio WhatsApp' });
    }

    return res.status(200).json({ status: 'success', sid: result.sid });
  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message || 'Errore server' });
  }
};
