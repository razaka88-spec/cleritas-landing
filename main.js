// Language toggle
document.querySelectorAll('.lang-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.id.split('-')[0];
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = el.dataset[lang];
    });
  });
});

// Category filter
document.querySelectorAll('.toggle-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'block' : 'none';
    });
  });
});

// Simple cart
let cartCount = 0;
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;
    document.getElementById('cart-count').textContent = cartCount;
    alert('Added to cart!');
  });
});

// Order Form Submission
const orderForm = document.getElementById('order-form');
orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(orderForm).entries());
  try {
    const res = await fetch('https://your-worker-url/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    document.getElementById('order-msg').textContent = result.success ? 
      `Order placed! ID: ${result.orderId}` : 'Failed to place order.';
    orderForm.reset();
  } catch(err) {
    document.getElementById('order-msg').textContent = 'Error connecting to server.';
  }
});
