// Cart state
let cart = [];
let currentLang = 'en';

// Products data
const products = {
  '1': { name: "Men's Multivitamin", price: 19.99, category: 'men' },
  '2': { name: "Women's Multivitamin", price: 19.99, category: 'women' },
  '3': { name: "Kids Multivitamin", price: 14.99, category: 'children' },
  '4': { name: "Senior Multivitamin", price: 21.99, category: 'elderly' },
  '5': { name: "General Multivitamin", price: 16.99, category: 'general' }
};

// Language toggle
document.querySelectorAll('.lang-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.id.split('-')[0];
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = el.dataset[currentLang];
    });
  });
});

// Category filter
document.querySelectorAll('.toggle-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-bar button').forEach(b => b.classList.remove('active'));
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
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    const id = card.dataset.id;
    const price = parseFloat(card.dataset.price);
    const name = card.querySelector('h3').textContent;
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    
    updateCartCount();
    showNotification('Added to cart!');
  });
});

// Update cart count
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = total;
}

// Show notification
function showNotification(message) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  notif.style.cssText = 'position: fixed; top: 100px; right: 20px; background: #2563eb; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 2000; animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);';
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 2000);
}

// Open cart modal
document.getElementById('open-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.add('active');
  renderCart();
});

// Close cart modal
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.remove('active');
});

// Close on outside click
document.getElementById('cart-modal').addEventListener('click', (e) => {
  if (e.target.id === 'cart-modal') {
    document.getElementById('cart-modal').classList.remove('active');
  }
});

// Render cart
function renderCart() {
  const cartView = document.getElementById('cart-view');
  
  if (cart.length === 0) {
    cartView.innerHTML = '<div class="empty-cart"><p data-en="Your cart is empty" data-so="Shantaadu waa madhan tahay">Your cart is empty</p></div>';
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  cartView.innerHTML = `
    <div class="cart-items">
      ${cart.map((item, index) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="changeQuantity(${index}, -1)">−</button>
            <span style="margin: 0 0.5rem; font-weight: 600;">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-total">
      Total: $${total.toFixed(2)}
    </div>
    <div class="order-form">
      <form id="checkout-form" onsubmit="submitOrder(event)">
        <div class="form-group">
          <label data-en="Full Name" data-so="Magacaaga">Full Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label data-en="Email Address" data-so="Cinwaanka Email">Email Address</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label data-en="Phone Number" data-so="Lambarka Taleefanka">Phone Number</label>
          <input type="tel" name="phone" required>
        </div>
        <div class="form-group">
          <label data-en="Delivery Address" data-so="Cinwaanka Gaarsiinta">Delivery Address</label>
          <textarea name="address" required></textarea>
        </div>
        <button type="submit" class="submit-order" data-en="Place Order" data-so="Gudbi Dalabka">Place Order</button>
      </form>
    </div>
  `;
}

// Change quantity
function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartCount();
  renderCart();
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
}

// Submit order
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
  
  const submitBtn = form.querySelector('.submit-order');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  try {
    // Replace this URL with your actual Cloudflare Worker endpoint
    const response = await fetch('https://your-worker-url.workers.dev/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Fallback to simulated success for demo purposes
    setTimeout(() => {
      const orderId = 'ORD-' + Date.now();
      showOrderSuccess(orderId, orderData.total);
    }, 1500);
  }
}

// Show order success
function showOrderSuccess(orderId, total) {
  document.getElementById('cart-view').innerHTML = `
    <div class="order-success">
      <h3>✅ Order Placed Successfully!</h3>
      <p>Order ID: <strong>${orderId}</strong></p>
      <p>Total: <strong>$${total.toFixed(2)}</strong></p>
      <p style="margin-top: 1rem; color: #6b7280;">We'll send a confirmation email shortly</p>
      <button onclick="closeAndReset()" class="submit-order" style="margin-top: 1.5rem;">Continue Shopping</button>
    </div>
  `;
  
  console.log('Order placed:', { orderId, total });
}

// Close and reset
function closeAndReset() {
  cart = [];
  updateCartCount();
  document.getElementById('cart-modal').classList.remove('active');
  showNotification('Thank you for your order!');
}
