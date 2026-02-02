// Pharmacy E-commerce JavaScript - Cleritas Pharma
let cart = [];
let currentLang = 'en';

// Product catalog with bilingual names
const products = {
  '1': { 
    name: "Women's Folic Acid + Pregnancy", 
    nameSo: "Folic Acid Dumar + Jir", 
    price: 24.99 
  },
  '2': { 
    name: "Iron + Vitamin C", 
    nameSo: "Birta + Fiitamina C", 
    price: 18.99 
  },
  '3': { 
    name: "General Multivitamin", 
    nameSo: "Multivitamin Guud", 
    price: 16.99 
  },
  '4': { 
    name: "Children's Chewable Vitamins", 
    nameSo: "Fiitaminoyin Carruur ah oo La Cunno", 
    price: 14.99 
  }
};

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize DOM elements
const elements = {
  langButtons: $$('.lang-toggle button'),
  cartBtn: $('#open-cart'),
  cartCount: $('#cart-count'),
  cartModal: $('#cart-modal'),
  closeCartBtn: $('#close-cart'),
  searchInput: $('input[type="search"]'),
  filterButtons: $$('.filter-btn'),
  productCards: $$('.product-card'),
  categoryButtons: $$('.category-btn')
};

// Language toggle functionality
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-toggle button');
  const translatableElements = document.querySelectorAll('[data-en][data-so]');
  const placeholders = $$('[data-placeholder-so]');
  
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
      
      // Update placeholders
      placeholders.forEach(el => {
        el.placeholder = el.dataset[`placeholder-${lang}`];
      });
      
      // Save preference
      localStorage.setItem('language', lang);
      
      // Update cart display
      if (cart.length > 0) {
        renderCart();
      }
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
  
  // Update placeholders
  const placeholders = $$('[data-placeholder-so]');
  placeholders.forEach(el => {
    if (currentLang === 'so' && el.dataset.placeholderSo) {
      el.placeholder = el.dataset.placeholderSo;
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
  const product = products[id];
  const name = currentLang === 'so' ? product.nameSo : product.name;
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  updateCartCount();
  showNotification(currentLang === 'so' ? 'Waa lagu daray shandadan' : 'Added to cart');
  
  // Save to localStorage for persistence
  saveCartToStorage();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (elements.cartCount) {
    elements.cartCount.textContent = total;
    elements.cartBtn.setAttribute('aria-label', `${currentLang === 'so' ? 'Shandada' : 'Shopping cart'} ${currentLang === 'so' ? 'waxaa ku jira' : 'with'} ${total} ${currentLang === 'so' ? 'alab' : 'items'}`);
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
  
  // Trigger animation
  setTimeout(() => notif.classList.add('show'), 10);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notif.parentNode) {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }
  }, 3000);
}

// Cart rendering
function renderCart() {
  const body = $('#cart-body');
  if (!body) return;
  
  if (cart.length === 0) {
    body.innerHTML = `<p class="empty-cart">${currentLang === 'so' ? 'Shantaadu waa madhan' : 'Your cart is empty'}</p>`;
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
          <button class="qty-btn" onclick="changeQuantity(${index}, -1)" aria-label="${currentLang === 'so' ? 'Yaree tirada' : 'Decrease quantity'}">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${index}, 1)" aria-label="${currentLang === 'so' ? 'Kordhi tirada' : 'Increase quantity'}">+</button>
          <button class="remove-btn" onclick="removeItem(${index})" aria-label="${currentLang === 'so' ? 'Ka saar' : 'Remove item'}">×</button>
        </div>
      </div>
    `).join('')}
    <div class="cart-total">
      <strong>${currentLang === 'so' ? 'Wadarta:' : 'Total:'} $${total.toFixed(2)}</strong>
    </div>
    <button class="checkout-btn" onclick="checkout()">${currentLang === 'so' ? 'Soo gudbi order' : 'Proceed to Checkout'}</button>
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
  if (cart[index]) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
    saveCartToStorage();
    showNotification(currentLang === 'so' ? 'Alabtu waa laga saaray' : 'Item removed from cart');
  }
}

// Checkout functionality
async function checkout() {
  if (cart.length === 0) {
    showNotification(currentLang === 'so' ? 'Shantaadu waa madhan' : 'Your cart is empty', 'error');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = 'ORD-' + Date.now();
  
  const orderData = {
    orderId,
    items: cart,
    total: total.toFixed(2),
    customer: {
      name: 'Customer', // Will be collected in a real checkout form
      email: 'customer@example.com',
      phone: '',
      address: ''
    }
  };
  
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification(currentLang === 'so' ? 'Order waa lagu guuleystay!' : 'Order placed successfully!');
      cart = [];
      updateCartCount();
      renderCart();
      saveCartToStorage();
      closeCart();
    } else {
      throw new Error('Order failed');
    }
  } catch (error) {
    showNotification(currentLang === 'so' ? 'Waxaa qalad ah ka dhacay orderga' : 'Order processing failed. Please try again.', 'error');
  }
}

// Search functionality
function initSearch() {
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase();
      filterProducts(query);
    }, 300));
  }
}

function filterProducts(query) {
  elements.productCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(query) || description.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Category filter functionality
function initFilters() {
  elements.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update button states
      elements.filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter products
      elements.productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Category button functionality
function initCategoryButtons() {
  elements.categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.closest('.category-card').dataset.category;
      
      // Scroll to products section
      $('#products').scrollIntoView({ behavior: 'smooth' });
      
      // Filter by category
      setTimeout(() => {
        elements.filterButtons.forEach(b => b.classList.remove('active'));
        const targetFilter = $(`.filter-btn[data-filter="${category}"]`);
        if (targetFilter) {
          targetFilter.classList.add('active');
        }
        
        elements.productCards.forEach(card => {
          if (card.dataset.category === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }, 500);
    });
  });
}

// Utility debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize everything when DOM is ready
function init() {
  loadCartFromStorage();
  
  // Load saved language
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['en', 'so'].includes(savedLang)) {
    currentLang = savedLang;
    
    // Set active language button
    elements.langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === savedLang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === savedLang);
    });
  }
  
  initLanguageToggle();
  updateLanguage();
  initCart();
  initSearch();
  initFilters();
  initCategoryButtons();
}

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Global functions for onclick handlers
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
window.checkout = checkout;
