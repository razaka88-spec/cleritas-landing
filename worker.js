// Cloudflare Worker for Cleritas Pharma Backend
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle POST /orders - Create new order
    if (url.pathname === '/orders' && request.method === 'POST') {
      try {
        const orderData = await request.json();
        
        // Generate unique order ID
        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Create complete order object
        const completeOrder = {
          ...orderData,
          orderId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Store in KV if available
        if (env.ORDERS) {
          await env.ORDERS.put(orderId, JSON.stringify(completeOrder));
        }

        // Send email notification if configured
        if (env.RESEND_API_KEY && orderData.customer.email) {
          await sendOrderEmail(orderData.customer.email, completeOrder, env);
        }

        console.log('Order created:', orderId);

        return new Response(JSON.stringify({
          success: true,
          orderId: orderId,
          message: 'Order placed successfully'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      } catch (error) {
        console.error('Order error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to process order'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle GET /orders - List all orders (admin)
    if (url.pathname === '/orders' && request.method === 'GET') {
      if (env.ORDERS) {
        try {
          const list = await env.ORDERS.list();
          const orders = await Promise.all(
            list.keys.map(async (key) => {
              const data = await env.ORDERS.get(key.name);
              return JSON.parse(data);
            })
          );

          return new Response(JSON.stringify({ 
            success: true,
            orders 
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch orders'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
    }

    // Handle GET /orders/:id - Get specific order
    if (url.pathname.startsWith('/orders/') && request.method === 'GET') {
      const orderId = url.pathname.split('/')[2];
      
      if (env.ORDERS) {
        try {
          const order = await env.ORDERS.get(orderId);
          
          if (order) {
            return new Response(order, {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          return new Response(JSON.stringify({
            success: false,
            error: 'Order not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch order'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
    }

    // Handle POST /contact - Contact form
    if (url.pathname === '/contact' && request.method === 'POST') {
      try {
        const contactData = await request.json();
        
        // Send contact email if configured
        if (env.RESEND_API_KEY) {
          await sendContactEmail(contactData, env);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Message sent successfully'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      } catch (error) {
        console.error('Contact error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to send message'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Default response
    return new Response(JSON.stringify({
      name: 'Cleritas Pharma API',
      version: '1.0.0',
      endpoints: [
        'POST /orders - Create order',
        'GET /orders - List orders',
        'GET /orders/:id - Get order',
        'POST /contact - Send contact message'
      ]
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

// Send order confirmation email using Resend
async function sendOrderEmail(email, order, env) {
  try {
    const emailBody = {
      from: 'Cleritas Pharma <orders@cleritaspharma.com>',
      to: email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Order Confirmed!</h1>
          <p>Thank you for your order from Cleritas Pharma.</p>
          
          <div style="background: #f8fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8eef3;">
            <p><strong>Delivery Address:</strong></p>
            <p>${order.customer.address}</p>
          </div>

          <p style="margin-top: 30px; color: #5a6c7d;">
            We'll process your order shortly and send you tracking information once shipped.
          </p>

          <p style="color: #5a6c7d; font-size: 0.9rem; margin-top: 30px;">
            Best regards,<br>
            Cleritas Pharma Team
          </p>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    console.log('Order email sent to:', email);
  } catch (error) {
    console.error('Email error:', error);
  }
}

// Send contact form email
async function sendContactEmail(contactData, env) {
  try {
    const emailBody = {
      from: 'Cleritas Pharma <contact@cleritaspharma.com>',
      to: 'ab@cleritaspharma.com',
      reply_to: contactData.email,
      subject: `Contact Form: ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          
          <div style="background: #f8fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
          </div>

          <div style="margin-top: 20px;">
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-left: 3px solid #059669;">
              ${contactData.message}
            </p>
          </div>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
      throw new Error('Failed to send contact email');
    }

    console.log('Contact email sent');
  } catch (error) {
    console.error('Contact email error:', error);
  }
}
