export async function onRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    
    const emailBody = `
NEW ORDER - ${data.orderId}

Customer: ${data.customer.name}
Email: ${data.customer.email}
Phone: ${data.customer.phone}
Address: ${data.customer.address}

Items:
${data.items.map(item => `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: $${data.total}
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@cleritaspharma.com',
        to: ['orders@cleritaspharma.com'],
        subject: `New Order ${data.orderId}`,
        html: `<pre>${emailBody}</pre>`
      })
    });

    return new Response(JSON.stringify({ success: true, orderId: data.orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Order processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
