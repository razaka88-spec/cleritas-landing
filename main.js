// language toggle, banner, product modal, order form -> mailto
(function(){
  // elements
  const enBtn = document.getElementById('lang-en');
  const soBtn = document.getElementById('lang-so');
  const year = document.getElementById('year');
  const banner = document.getElementById('top-banner');
  const bannerClose = document.getElementById('banner-close');
  const orderForm = document.getElementById('order-form');
  const orderConfirm = document.getElementById('order-confirm');

  // set year
  if(year) year.textContent = new Date().getFullYear();

  // language functions
  function setLang(lang){
    document.querySelectorAll('[data-en]').forEach(n => n.style.display = (lang==='en') ? '' : 'none');
    document.querySelectorAll('[data-so]').forEach(n => n.style.display = (lang==='so') ? '' : 'none');
    enBtn.classList.toggle('active', lang==='en');
    soBtn.classList.toggle('active', lang==='so');
    document.documentElement.lang = (lang === 'so') ? 'so' : 'en';
    localStorage.setItem('cleritas-lang', lang);
  }
  enBtn.addEventListener('click', ()=> setLang('en'));
  soBtn.addEventListener('click', ()=> setLang('so'));
  // read preference
  const pref = localStorage.getItem('cleritas-lang') || 'en';
  setLang(pref);

  // banner close
  bannerClose?.addEventListener('click', ()=>{ banner.style.display = 'none'; localStorage.setItem('cleritas-banner','closed'); });
  if(localStorage.getItem('cleritas-banner') === 'closed') banner.style.display = 'none';

  // product modal (simple)
  function $(sel, scope=document){ return scope.querySelector(sel); }
  function $all(sel, scope=document){ return Array.from(scope.querySelectorAll(sel)); }

  // create modal element dynamically to keep HTML lean
  let modal = null;
  function createModal(){
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-panel" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close">×</button>
        <div class="modal-body">
          <div class="modal-left">
            <div class="product-image" style="width:160px;height:120px;background:#f6fbff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ab7ff">Image</div>
          </div>
          <div class="modal-right">
            <h3 class="m-title"></h3>
            <p class="muted m-sku"></p>
            <p class="m-desc"></p>
            <ul class="features m-feat"></ul>
            <div class="modal-actions">
              <button class="btn primary modal-order">Order</button>
              <button class="btn ghost modal-close">Close</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', closeModal));
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.modal-order').addEventListener('click', ()=>{
      // prefill order form with SKU if available
      const sku = modal.dataset.sku || '';
      if(document.getElementById('product-select')) document.getElementById('product-select').value = sku;
      closeModal();
      document.location.hash = '#order';
      // focus name field
      setTimeout(()=> document.getElementById('cust-name')?.focus(), 200);
    });
  }

  function openModal(product){
    if(!modal) createModal();
    modal.style.display = '';
    modal.dataset.sku = product.sku || '';
    modal.querySelector('.m-title').textContent = product.title_en || product.title;
    modal.querySelector('.m-sku').textContent = product.sku ? `SKU: ${product.sku}` : '';
    modal.querySelector('.m-desc').textContent = product.desc_en || '';
    const feat = modal.querySelector('.m-feat');
    feat.innerHTML = '';
    (product.features || []).forEach(f => {
      const li = document.createElement('li'); li.textContent = f; feat.appendChild(li);
    });
  }
  function closeModal(){ if(modal) modal.style.display = 'none'; }

  // product data (matching HTML cards)
  const products = {
    "CPF-W-001": {
      sku:"CPF-W-001",
      title_en:"Women — Iron 60mg + Folic",
      title_so:"Haween — Bir 60mg + Folic",
      desc_en:"Daily iron support for women of reproductive age.",
      desc_so:"Taageero bir maalinle ah haweenka da'da taranka.",
      features:["Iron (ferrous fumarate) 60mg","Folic Acid 400µg","Batch & expiry on box"]
    },
    "CPF-M-001": {
      sku:"CPF-M-001",
      title_en:"Men — B-Complex + Zinc",
      title_so:"Rag — B-Complex + Zinc",
      desc_en:"Supports energy metabolism and recovery.",
      features:["B-complex vitamins","Zinc 15mg","30–60 day supply"]
    },
    "CPF-K-001": {
      sku:"CPF-K-001",
      title_en:"Children — Multivitamin Syrup",
      title_so:"Carruur — Syrup Multivitamin",
      desc_en:"Growth & immune support; flavoured syrup or chewables.",
      features:["Vitamins A,C,D","Zinc","Sugar-free option available"]
    },
    "CPF-PREN-001": {
      sku:"CPF-PREN-001",
      title_en:"Prenatal — Complete",
      title_so:"Uurka — Dhammaystiran",
      desc_en:"Formulated for preconception and pregnancy support.",
      features:["Folic Acid, Iron, DHA","Doctor-rec recommended"]
    },
    "CPF-ELD-001": {
      sku:"CPF-ELD-001",
      title_en:"Elderly — Calcium + Vitamin D",
      title_so:"Waayeel — Kalsiyam + Vitamin D",
      desc_en:"Helps maintain bone strength and mobility.",
      features:["Calcium 500mg","Vitamin D3 800IU"]
    },
    "CPF-IMM-001": {
      sku:"CPF-IMM-001",
      title_en:"Immune — Vitamin C + Zinc",
      title_so:"Difaac — Vitamin C + Zinc",
      desc_en:"Rapid immune support — day or night.",
      features:["Vitamin C 500mg","Zinc 10–15mg"]
    }
  };

  // attach listeners to product cards
  $all('.view-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sku = btn.dataset.sku || btn.closest('.product-card')?.dataset.sku;
      const p = products[sku];
      if(p) {
        // show language-appropriate fields
        const lang = localStorage.getItem('cleritas-lang') || 'en';
        if(lang === 'so') {
          p.title = p.title_so || p.title_en;
          p.desc = p.desc_so || p.desc_en;
        } else {
          p.title = p.title_en;
          p.desc = p.desc_en;
        }
        openModal(p);
      }
    });
  });

  // order form -> start mailto flow
  orderForm?.addEventListener('submit', function(ev){
    ev.preventDefault();
    const data = new FormData(orderForm);
    const name = data.get('name') || '';
    const phone = data.get('phone') || '';
    const address = data.get('address') || '';
    const product = data.get('product') || '';
    const qty = data.get('quantity') || '1';
    const notes = data.get('notes') || '';

    if(!name || !phone || !address || !product){
      orderConfirm.style.display = '';
      orderConfirm.textContent = (localStorage.getItem('cleritas-lang') === 'so') ? 'Fadlan buuxi dhammaan goobaha looga baahan yahay.' : 'Please fill all required fields.';
      setTimeout(()=> orderConfirm.style.display='none', 4000);
      return;
    }

    // build email body
    const to = 'orders@cleritaspharma.com';
    const subject = encodeURIComponent(`Order from ${name} — ${product} x${qty}`);
    let body = `Order details:\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nProduct: ${product}\nQuantity: ${qty}\nNotes: ${notes}\n\n--\nCleritas Pharma order via website\n`;
    const mailto = `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`;

    // open mail client
    window.location.href = mailto;

    // show confirmation message on page
    orderConfirm.style.display = '';
    orderConfirm.textContent = (localStorage.getItem('cleritas-lang') === 'so') ? 'Fariinta email-ka ayaa la furay — fadlan dir si aad u dhameystirto dalabka.' : 'Email composer opened — please send to complete your order.';
    setTimeout(()=> orderConfirm.style.display='none', 6000);
    orderForm.reset();
  });

  // reset button
  document.getElementById('order-reset')?.addEventListener('click', ()=> orderForm.reset());
  document.getElementById('order-reset-so')?.addEventListener('click', ()=> orderForm.reset());

})();
