// Cloudflare Worker for handling orders
// Deploy this to handle order submissions

export default {
  async fetch(request, env) {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Handle order submission
    if (url.pathname === '/orders' && request.method === 'POST') {
      try {
        const orderData = await request.json();
        
        // Generate unique order ID
        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Add order ID and status
        const completeOrder = {
          ...orderData,
          orderId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Store in KV (if you have KV namespace set up)
        if (env.ORDERS) {
          await env.ORDERS.put(orderId, JSON.stringify(completeOrder));
        }

        // Send email notification (optional - requires email service)
        // await sendOrderEmail(completeOrder);

        // Log order for debugging
        console.log('Order received:', completeOrder);

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

    // Handle GET requests to retrieve orders (admin only)
    if (url.pathname === '/orders' && request.method === 'GET') {
      if (env.ORDERS) {
        const list = await env.ORDERS.list();
        const orders = await Promise.all(
          list.keys.map(async (key) => {
            const data = await env.ORDERS.get(key.name);
            return JSON.parse(data);
          })
        );

        return new Response(JSON.stringify({ orders }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle GET request for specific order
    if (url.pathname.startsWith('/orders/') && request.method === 'GET') {
      const orderId = url.pathname.split('/')[2];
      
      if (env.ORDERS) {
        const order = await env.ORDERS.get(orderId);
        
        if (order) {
          return new Response(order, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      return new Response(JSON.stringify({
        error: 'Order not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Default response
    return new Response('Cleritas Pharma API', {
      headers: corsHeaders
    });
  }
};

// Optional: Email notification function
// Uncomment and configure with your email service (SendGrid, Mailgun, etc.)
/*
async function sendOrderEmail(order) {
  const emailData = {
    to: order.customer.email,
    from: 'orders@cleritaspharma.com',
    subject: `Order Confirmation - ${order.orderId}`,
    text: `
      Thank you for your order!
      
      Order ID: ${order.orderId}
      Total: $${order.total.toFixed(2)}
      
      Items:
      ${order.items.map(item => `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
      
      Delivery Address:
      ${order.customer.address}
      
      We'll process your order shortly.
      
      Best regards,
      Cleritas Pharma Team
    `
  };

  // Send via your email service
  // await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Bearer YOUR_SENDGRID_API_KEY',
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(emailData)
  // });
}
*/
