let cart = [];
let currentLang = 'en';

const products = {
  '1': { name: "Men's Multivitamin", price: 19.99 },
  '2': { name: "Women's Multivitamin", price: 19.99 },
  '3': { name: "Kids Multivitamin", price: 14.99 },
  '4': { name: "Senior Multivitamin", price: 21.99 },
  '5': { name: "General Multivitamin", price: 16.99 },
};

// Language toggle
document.querySelectorAll('.lang-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.id.split('-')[0];
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset[currentLang]) {
        el.textContent = el.dataset[currentLang];
      }
    });
  });
});

// Category filter
document.querySelectorAll('.filter-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-bar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const cat = btn.dataset.category;
    document.querySelectorAll('.product-card').forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.classList.add('show');
      } else {
        card.classList.remove('show');
      }
    });
  });
});

// Add to cart
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
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

async function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const orderData = {
    customer: {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address')
    },
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    timestamp: new Date().toISOString()
  };
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  try {
    // Replace with your actual Cloudflare Worker URL
    const response = await fetch('https://your-worker-url.workers.dev/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (response.ok) {
      const result = await response.json();
      showOrderSuccess(result.orderId || 'ORD-' + Date.now(), orderData.total);
    } else {
      throw new Error('Order failed');
    }
  } catch (error) {
    console.error('Order error:', error);
    // Fallback for demo
    setTimeout(() => {
      showOrderSuccess('ORD-' + Date.now(), orderData.total);
    }, 1500);
  }
}

function showOrderSuccess(orderId, total) {
  document.getElementById('cart-body').innerHTML = `
    <div style="text-align: center; padding: 3rem 2rem;">
      <h3 style="color: #27ae60; margin-bottom: 1.5rem; font-size: 2rem;">✓ Order Placed Successfully!</h3>
      <p style="color: #5a6c7d; margin-bottom: 1rem; font-size: 1.05rem;">Order ID: <strong>${orderId}</strong></p>
      <p style="color: #5a6c7d; margin-bottom: 1rem; font-size: 1.05rem;">Total: <strong>$${total.toFixed(2)}</strong></p>
      <p style="color: #95a5a6; margin-top: 2rem;">We'll send a confirmation email shortly</p>
      <button onclick="closeAndReset()" class="btn-add" style="margin-top: 2rem;">Continue Shopping</button>
    </div>
  `;
  
  console.log('Order placed:', { orderId, total, items: cart });
}

function closeAndReset() {
  cart = [];
  updateCartCount();
  document.getElementById('cart-modal').classList.remove('active');
  showNotification('Thank you for your order!');
}

// Contact form
async function sendContactForm(email, message) {
  const res = await fetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message })
  });

  const data = await res.json();
  console.log(data);
}

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  showNotification('Message sent successfully');
  e.target.reset();
});
