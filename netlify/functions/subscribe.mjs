const BREVO = 'https://api.brevo.com/v3';
const LIST_ID = 10;
const TEMPLATE_ID = 13;
const GRACIAS_URL = 'https://mujeralquimicadigital.github.io/el-primer-paso/gracias.html';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const formData = await req.formData();
  const nombre = (formData.get('nombre') || '').toString();
  const email = (formData.get('email') || '').toString();
  const whatsapp = (formData.get('whatsapp') || '').toString();

  const apiKey = Netlify.env.get('BREVO_API_KEY');
  const HEADERS = {
    'api-key': apiKey,
    'Content-Type': 'application/json'
  };

  let contactResult = null;
  let contactError = null;
  try {
    const r = await fetch(`${BREVO}/contacts`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre, WHATSAPP: whatsapp },
        listIds: [LIST_ID],
        updateEnabled: true
      })
    });
    contactResult = { status: r.status, body: await r.text() };
  } catch (err) {
    contactError = String(err);
  }

  let emailResult = null;
  let emailError = null;
  try {
    const r2 = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        to: [{ email, name: nombre }],
        templateId: TEMPLATE_ID,
        params: { NOMBRE: nombre }
      })
    });
    emailResult = { status: r2.status, body: await r2.text() };
  } catch (err) {
    emailError = String(err);
  }

  const url = new URL(req.url);
  if (url.searchParams.get('debug')) {
    return new Response(JSON.stringify({
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      contactResult, contactError, emailResult, emailError
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: GRACIAS_URL }
  });
};

export const config = {
  path: '/subscribe'
};
