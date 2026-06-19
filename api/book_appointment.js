const DEFAULT_WHATSAPP_TO = '393347992295';
const MAX_BODY_SIZE = 5000;
const ALLOWED_SLOTS = new Set(['Mattina', 'Pomeriggio']);
const ALLOWED_TOPICS = new Set([
  'Ambienti 3D',
  'Montaggio Video',
  'Gestionale',
  'Apps&Giochi',
  'Analisi Di Mercato',
  'Real to 3D Experience'
]);

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function localIsoDate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function validatePayload(raw) {
  const data = {
    nome: cleanText(raw.nome, 80),
    email: cleanText(raw.email, 120).toLowerCase(),
    telefono: cleanText(raw.telefono, 24),
    data: cleanText(raw.data, 10),
    slot: cleanText(raw.slot, 20),
    argomento: cleanText(raw.argomento, 60)
  };

  if (data.nome.length < 2 || !/^[\p{L}\p{M}' .-]+$/u.test(data.nome)) {
    return { error: 'Inserisci un nome valido.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    return { error: 'Inserisci un indirizzo email valido.' };
  }
  if (!/^\+?[0-9 ()-]{7,24}$/.test(data.telefono)) {
    return { error: 'Inserisci un numero di telefono valido.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data) || data.data < localIsoDate(new Date())) {
    return { error: 'Seleziona una data valida.' };
  }
  if (!ALLOWED_SLOTS.has(data.slot)) {
    return { error: 'Seleziona una fascia oraria valida.' };
  }
  if (!ALLOWED_TOPICS.has(data.argomento)) {
    return { error: 'Seleziona un argomento valido.' };
  }

  return { data };
}

function buildMessage(data) {
  return [
    'Nuova richiesta di appuntamento',
    `Nome: ${data.nome}`,
    `Email: ${data.email}`,
    `Telefono: ${data.telefono}`,
    `Data: ${data.data}`,
    `Fascia: ${data.slot}`,
    `Argomento: ${data.argomento}`
  ].join('\n');
}

function normalizeWhatsAppAddress(value) {
  if (!value) return '';
  return value.startsWith('whatsapp:') ? value : `whatsapp:+${value.replace(/\D/g, '')}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ status: 'error', error: 'Metodo non consentito.' });
  }

  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return res.status(415).json({ status: 'error', error: 'Il contenuto deve essere in formato JSON.' });
  }

  try {
    const raw = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (JSON.stringify(raw).length > MAX_BODY_SIZE) {
      return res.status(413).json({ status: 'error', error: 'Richiesta troppo grande.' });
    }

    // I bot compilano spesso il campo invisibile. Rispondiamo senza inoltrare dati.
    if (cleanText(raw.website, 120)) {
      return res.status(200).json({ status: 'success', filtered: true });
    }

    const submittedAt = Number(raw.submittedAt);
    if (Number.isFinite(submittedAt) && Date.now() - submittedAt < 1200) {
      return res.status(429).json({ status: 'error', error: 'Invio troppo rapido. Attendi un momento e riprova.' });
    }

    const validation = validatePayload(raw);
    if (validation.error) {
      return res.status(400).json({ status: 'error', error: validation.error });
    }

    const data = validation.data;
    const message = buildMessage(data);
    const toNumber = String(process.env.BOOKING_WHATSAPP_TO || DEFAULT_WHATSAPP_TO).replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${toNumber}?text=${encodeURIComponent(message)}`;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM);
    const to = normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_TO || toNumber);

    if (!sid || !token || !from) {
      return res.status(200).json({ status: 'success', manual: true, whatsappUrl });
    }

    const body = new URLSearchParams({ From: from, To: to, Body: message });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;

    try {
      response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Twilio booking error', { status: response.status, code: result.code });
      return res.status(502).json({ status: 'error', error: 'Il servizio di messaggistica non è disponibile. Riprova più tardi.' });
    }

    return res.status(200).json({ status: 'success', sid: result.sid });
  } catch (error) {
    console.error('Booking endpoint error', { name: error && error.name });
    return res.status(500).json({ status: 'error', error: 'Errore temporaneo del server. Riprova più tardi.' });
  }
};
