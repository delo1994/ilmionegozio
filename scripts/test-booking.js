const assert = require('assert');
const handler = require('../api/book_appointment.js');

function createResponse() {
  return {
    code: 200,
    headers: {},
    body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
}

async function request(method, body, contentType = 'application/json') {
  const response = createResponse();
  await handler({ method, body, headers: { 'content-type': contentType } }, response);
  return response;
}

async function run() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const valid = await request('POST', {
    nome: 'Mario Rossi',
    email: 'mario@example.it',
    telefono: '+39 333 1234567',
    data: tomorrow,
    slot: 'Mattina',
    argomento: 'Ambienti 3D',
    privacyConsent: true,
    submittedAt: Date.now() - 3000
  });
  assert.equal(valid.code, 200);
  assert.equal(valid.body.status, 'success');
  assert.equal(valid.body.manual, true);
  assert.ok(valid.body.whatsappUrl.startsWith('https://wa.me/'));

  const invalidEmail = await request('POST', {
    nome: 'Mario Rossi',
    email: 'non-valida',
    telefono: '+39 333 1234567',
    data: tomorrow,
    slot: 'Mattina',
    argomento: 'Ambienti 3D',
    privacyConsent: true,
    submittedAt: Date.now() - 3000
  });
  assert.equal(invalidEmail.code, 400);

  const missingConsent = await request('POST', {
    nome: 'Mario Rossi',
    email: 'mario@example.it',
    telefono: '+39 333 1234567',
    data: tomorrow,
    slot: 'Mattina',
    argomento: 'Ambienti 3D',
    submittedAt: Date.now() - 3000
  });
  assert.equal(missingConsent.code, 400);
  assert.equal(missingConsent.body.error, 'Devi accettare l\'informativa privacy.');

  const malformed = await request('POST', '{email:non-valida}');
  assert.equal(malformed.code, 400);
  assert.equal(malformed.body.error, 'JSON non valido.');

  const honeypot = await request('POST', { website: 'spam.example' });
  assert.equal(honeypot.code, 200);
  assert.equal(honeypot.body.filtered, true);

  const method = await request('GET');
  assert.equal(method.code, 405);
  assert.equal(method.headers['Cache-Control'], 'no-store, max-age=0');

  console.log('Test API appuntamenti completati: 6 casi superati.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
