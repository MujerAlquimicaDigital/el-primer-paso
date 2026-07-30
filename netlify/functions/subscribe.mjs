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

  const HEADERS = {
    'api-key': Netlify.env.get('BREVO_API_KEY'),
    'Content-Type': 'application/json'
  };

  try {
    await fetch(`${BREVO}/contacts`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre, WHATSAPP: whatsapp },
        listIds: [LIST_ID],
        updateEnabled: true
      })
    });
  } catch (err) {
    console.error('Error guardando contacto:', err);
  }

  try {
    await fetch(`${BREVO}/smtp/email`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        to: [{ email, name: nombre }],
        templateId: TEMPLATE_ID,
        params: { NOMBRE: nombre }
      })
    });
  } catch (err) {
    console.error('Error enviando email:', err);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: GRACIAS_URL }
  });
};

export const config = {
  path: '/subscribe'
};
