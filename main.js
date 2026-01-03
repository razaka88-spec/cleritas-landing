let cart = [];
let currentLang = 'en';

// Updated products for 4 items
const products = {
  '1': { name: "Women's Folic Acid + Pregnancy", price: 24.99 },
  '2': { name: "Iron + Vitamin C", price: 18.99 },
  '3': { name: "General Multivitamin", price: 16.99 },
  '4': { name: "Children's Chewable Vitamins", price: 14.99 }
};

// Language toggle
document.querySelectorAll('.lang-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentLang = btn.id.split('-')[0];
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset[currentLang]) {
        el.textContent = el.dataset[currentLang];
      }
    });
  });
});

// Add to cart
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    
    const id = card.dataset.id;
    const price = parseFloat(card.dataset.price);
    const name = card.querySelector('h3').textContent;
    
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    
    updateCartCount();
    showNotification('Added to cart');
  });
});

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = total;
}

function showNotification(msg) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// Open cart
document.getElementById('open-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.add('active');
  renderCart();
});

// Close cart
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.remove('active');
});

document.getElementById('cart-modal').addEventListener('click', (e) => {
  if (e.target.id === 'cart-modal') {
    document.getElementById('cart-modal').classList.remove('active');
  }
});

function renderCart() {
  const body = document.getElementById('cart-body');
  
  if (cart.length === 0) {
    body.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  body.innerHTML = `
    ${cart.map((item, i) => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <div class="cart-actions">
          <button class="qty-btn" onclick="changeQuantity(${i}, -1)">−</button>
          <span style="margin: 0 0.8rem; font-weight: 500;">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${i}, 1)">+</button>
          <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
        </div>
      </div>
    `).join('')}
    <div class="cart-total">Total: $${total.toFixed(2)}</div>
    <div style="padding: 2rem;">
      <form id="checkout-form" onsubmit="submitOrder(event)">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" required>
        </div>
        <div class="form-group">
          <label>Delivery Address</label>
          <textarea name="address" required></textarea>
        </div>
        <button type="submit" class="btn-add">Place Order</button>
      </form>
    </div>
  `;
}

function changeQuantity(i, delta) {
  cart[i].quantity += delta;
  if (cart[i].quantity <= 0) {
    cart.splice(i, 1);
  }
  updateCartCount();
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  updateCartCount();
  renderCart();
}

// Submit order via Formspree
async function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  // Prepare order details
  const orderDetails = {
    customer: {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address')
    },
    items: cart.map(item => ({
      product: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: (item.price * item.quantity).toFixed(2)
    })),
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
    orderId: 'ORD-' + Date.now(),
    date: new Date().toLocaleString()
  };

  // Create email body
  const emailBody = `
NEW ORDER RECEIVED!

Order ID: ${orderDetails.orderId}
Date: ${orderDetails.date}

CUSTOMER INFORMATION:
Name: ${orderDetails.customer.name}
Email: ${orderDetails.customer.email}
Phone: ${orderDetails.customer.phone}
Address: ${orderDetails.customer.address}

ORDER ITEMS:
${orderDetails.items.map(item => 
  `- ${item.product} × ${item.quantity} = $${item.subtotal}`
).join('\n')}

TOTAL: $${orderDetails.total}

---
This order was placed through Cleritas Pharma website.
  `;

  try {
    // Using Formspree - Replace YOUR_FORM_ID with your actual Formspree form ID
    // Get your form ID from https://formspree.io (free, no credit card needed)
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: orderDetails.customer.name,
        email: orderDetails.customer.email,
        phone: orderDetails.customer.phone,
        subject: `New Order - ${orderDetails.orderId}`,
        message: emailBody
      })
    });

    if (response.ok) {
      showOrderSuccess(orderDetails.orderId, orderDetails.total);
    } else {
      throw new Error('Order submission failed');
    }
  } catch (error) {
    console.error('Order error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
    alert('There was an error processing your order. Please try again or contact us directly at ab@cleritaspharma.com');
  }
}

function showOrderSuccess(orderId, total) {
  document.getElementById('cart-body').innerHTML = `
    <div style="text-align: center; padding: 3rem 2rem;">
      <h3 style="color: #27ae60; margin-bottom: 1.5rem; font-size: 2rem;">✓ Order Placed Successfully!</h3>
      <p style="color: #5a6c7d; margin-bottom: 1rem; font-size: 1.05rem;">Order ID: <strong>${orderId}</strong></p>
      <p style="color: #5a6c7d; margin-bottom: 1rem; font-size: 1.05rem;">Total: <strong>$${total}</strong></p>
      <p style="color: #95a5a6; margin-top: 2rem;">We've received your order and will contact you shortly via email or phone to confirm.</p>
      <button onclick="closeAndReset()" class="btn-add" style="margin-top: 2rem;">Continue Shopping</button>
    </div>
  `;
  
  console.log('Order placed:', orderId);
}

function closeAndReset() {
  cart = [];
  updateCartCount();
  document.getElementById('cart-modal').classList.remove('active');
  showNotification('Thank you for your order!');
}

// Contact form via Formspree
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    // Using Formspree - Replace YOUR_CONTACT_FORM_ID with your actual form ID
    const response = await fetch('https://formspree.io/f/YOUR_CONTACT_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      })
    });

    if (response.ok) {
      showNotification('Message sent successfully!');
      form.reset();
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Contact error:', error);
    alert('Failed to send message. Please email us directly at ab@cleritaspharma.com');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});
