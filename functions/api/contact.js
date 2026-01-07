export async function onRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    
    const emailBody = `
Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'info@cleritaspharma.com',
        to: ['info@cleritaspharma.com'],
        subject: `Contact Form - ${data.name}`,
        html: `<pre>${emailBody}</pre>`
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Message sending failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
