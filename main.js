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
  elements.langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      elements.langButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      
      // Update language
      currentLang = btn.id.split('-')[0];
      updateLanguage();
    });
  });
}

function updateLanguage() {
  $$('[data-en]').forEach(el => {
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

function handleContactSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(elements.contactForm);
  const data = Object.fromEntries(formData);
  
  // Basic validation
  if (!data.name || !data.email || !data.message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  // Simulate form submission
  showNotification('Message sent successfully!', 'success');
  elements.contactForm.reset();
  
  // In a real implementation, you would send this to a server
  console.log('Form submitted:', data);
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
  
  // In a real implementation, this would redirect to a checkout page
  showNotification('Redirecting to checkout...', 'success');
  console.log('Checkout:', cart);
  
  // For demo purposes, clear cart after "checkout"
  setTimeout(() => {
    cart = [];
    updateCartCount();
    renderCart();
    saveCartToStorage();
    closeCart();
  }, 2000);
}

// Initialize everything when DOM is ready
function init() {
  loadCartFromStorage();
  initLanguageToggle();
  initCart();
  initContactForm();
}

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
