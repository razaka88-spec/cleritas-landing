// State management
let cart = [];
let currentLang = 'en';

// Product catalog
const products = {
  '1': { name: "Women's Folic Acid + Pregnancy", price: 24.99 },
  '2': { name: "Iron + Vitamin C", price: 18.99 },
  '3': { name: "General Multivitamin", price: 16.99 },
  '4': { name: "Children's Chewable Vitamins", price: 14.99 }
};

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize DOM elements
const elements = {
  langButtons: $$('.lang-toggle button'),
  cartBtn: $('#open-cart'),
  cartCount: $('#cart-count'),
  cartModal: $('#cart-modal'),
  closeCartBtn: $('#close-cart'),
  contactForm: $('#contact-form')
};

// Language toggle functionality
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-toggle button');
  const translatableElements = document.querySelectorAll('[data-en][data-so]');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      currentLang = lang;
      
      // Update button states
      buttons.forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
        b.setAttribute('aria-pressed', b.dataset.lang === lang);
      });
      
      // Update all translatable elements
      translatableElements.forEach(el => {
        el.textContent = el.dataset[lang];
      });
      
      // Save preference
      localStorage.setItem('language', lang);
    });
  });
}

function updateLanguage() {
  const translatableElements = document.querySelectorAll('[data-en]');
  translatableElements.forEach(el => {
    if (el.dataset[currentLang]) {
      el.textContent = el.dataset[currentLang];
    }
  });
}

// Cart functionality
function initCart() {
  // Add to cart buttons
  $$('.btn-add').forEach(btn => {
    btn.addEventListener('click', handleAddToCart);
  });
  
  // Cart modal controls
  if (elements.cartBtn) {
    elements.cartBtn.addEventListener('click', openCart);
  }
  
  if (elements.closeCartBtn) {
    elements.closeCartBtn.addEventListener('click', closeCart);
  }
  
  if (elements.cartModal) {
    elements.cartModal.addEventListener('click', (e) => {
      if (e.target.id === 'cart-modal') {
        closeCart();
      }
    });
  }
}

function handleAddToCart(e) {
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
  
  // Save to localStorage for persistence
  saveCartToStorage();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (elements.cartCount) {
    elements.cartCount.textContent = total;
    elements.cartBtn.setAttribute('aria-label', `Shopping cart with ${total} items`);
  }
}

function openCart() {
  if (elements.cartModal) {
    elements.cartModal.classList.add('active');
    renderCart();
  }
}

function closeCart() {
  if (elements.cartModal) {
    elements.cartModal.classList.remove('active');
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('cleritas-cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('Could not save cart to localStorage');
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('cleritas-cart');
    if (saved) {
      cart = JSON.parse(saved);
      updateCartCount();
    }
  } catch (e) {
    console.warn('Could not load cart from localStorage');
  }
}

// Notification system
function showNotification(message, type = 'success') {
  const existing = $('.notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = `notification notification--${type}`;
  notif.textContent = message;
  notif.setAttribute('role', 'alert');
  notif.setAttribute('aria-live', 'polite');
  
  document.body.appendChild(notif);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notif.parentNode) {
      notif.remove();
    }
  }, 3000);
}

// Contact form handling
function initContactForm() {
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleContactSubmit);
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const formData = new FormData(elements.contactForm);
  const data = Object.fromEntries(formData);
  
  if (!data.name || !data.email || !data.message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('Message sent successfully!');
      elements.contactForm.reset();
    } else {
      throw new Error('Message failed');
    }
  } catch (error) {
    showNotification('Message sending failed. Please try again.', 'error');
  }
}

// Cart rendering
function renderCart() {
  const body = $('#cart-body');
  if (!body) return;
  
  if (cart.length === 0) {
    body.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  body.innerHTML = `
    ${cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <div class="cart-actions">
          <button class="qty-btn" onclick="changeQuantity(${index}, -1)" aria-label="Decrease quantity">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
          <button class="remove-btn" onclick="removeItem(${index})" aria-label="Remove item">×</button>
        </div>
      </div>
    `).join('')}
    <div class="cart-total">
      <strong>Total: $${total.toFixed(2)}</strong>
    </div>
    <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
  `;
}

function changeQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartCount();
    renderCart();
    saveCartToStorage();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  saveCartToStorage();
  showNotification('Item removed from cart');
}

function checkout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  
  document.getElementById('cart-body').innerHTML = `
    <div style="padding: 2rem;">
      <h3>Order Summary</h3>
      ${cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #e8eef3;">
          <span>${item.name} × ${item.quantity}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
      <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-weight: bold; font-size: 1.2rem;">
        <span>Total:</span>
        <span>$${total}</span>
      </div>
      <form id="checkout-form" style="margin-top: 2rem;">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Phone</label>
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
  
  document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
}

async function handleCheckout(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const orderData = {
    customer: {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address')
    },
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
    orderId: 'ORD-' + Date.now()
  };
  
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('Order placed successfully! Order ID: ' + orderData.orderId);
      cart = [];
      updateCartCount();
      closeCart();
      e.target.reset();
    } else {
      throw new Error('Order failed');
    }
  } catch (error) {
    showNotification('Order processing failed. Please try again.', 'error');
  }
}

// Initialize everything when DOM is ready
function init() {
  loadCartFromStorage();
  
  // Load saved language
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['en', 'so'].includes(savedLang)) {
    currentLang = savedLang;
  }
  
  initLanguageToggle();
  updateLanguage();
  initCart();
  initContactForm();
}

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
