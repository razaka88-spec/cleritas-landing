// main site JS - handles language toggle, banner close, modal quick view, and order prefill
(function(){
  // helpers
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const yearEl = qs('#year');

  // set year
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // language toggle
  function setLang(lang){
    qsa('[data-en]').forEach(el => el.style.display = (lang === 'en') ? '' : 'none');
    qsa('[data-so]').forEach(el => el.style.display = (lang === 'so') ? '' : 'none');
    qsa('.lang').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = (lang === 'so') ? 'so' : 'en';
    localStorage.setItem('cleritas-lang', lang);
  }
  // attach toggle buttons (works across pages)
  qsa('.lang').forEach(b => b.addEventListener('click', ()=> setLang(b.dataset.lang)));
  // initialize
  const pref = localStorage.getItem('cleritas-lang') || 'en';
  setLang(pref);

  // banner close
  const bannerClose = qs('#banner-close');
  const banner = qs('#top-banner');
  bannerClose?.addEventListener('click', ()=> { banner.style.display = 'none'; localStorage.setItem('cleritas-banner','closed'); });
  if(localStorage.getItem('cleritas-banner') === 'closed' && banner) banner.style.display = 'none';

  // product quick view modal
  let modal = qs('#product-modal');
  function openModal(data){
    if(!modal) return;
    modal.style.display = '';
    modal.setAttribute('aria-hidden','false');
    modal.querySelector('.m-title').textContent = data.title;
    modal.querySelector('.m-sku').textContent = `SKU: ${data.sku || ''}`;
    modal.querySelector('.m-desc').textContent = data.desc;
    const feat = modal.querySelector('.m-feat');
    feat.innerHTML = '';
    (data.features || []).forEach(f => {
      const li = document.createElement('li'); li.textContent = f; feat.appendChild(li);
    });
    // order link
    modal.querySelector('.modal-order').href = `order.html?sku=${encodeURIComponent(data.sku)}`;
  }
  function closeModal(){ if(modal){ modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); } }
  qsa('.view-btn').forEach(btn => {
    btn.addEventListener('click', ()=>{
      // product data map (same as in order page)
      const sku = btn.dataset.sku || btn.closest('.product-card')?.dataset.sku;
      const products = {
        "CPF-W-001": {sku:"CPF-W-001", title:"Women — Iron 60mg + Folic", desc:"Daily iron support for women of reproductive age.", features:["Iron (ferrous fumarate) 60mg","Folic Acid 400µg","Batch & expiry on box"]},
        "CPF-M-001": {sku:"CPF-M-001", title:"Men — B-Complex + Zinc", desc:"Supports energy metabolism and recovery.", features:["B-complex vitamins","Zinc 15mg"]},
        "CPF-K-001": {sku:"CPF-K-001", title:"Children — Multivitamin Syrup", desc:"Growth & immune support; syrup or chewables.", features:["Vitamins A,C,D","Zinc","Flavoured syrup"]},
        "CPF-PREN-001": {sku:"CPF-PREN-001", title:"Prenatal — Complete", desc:"Formulated for preconception and pregnancy support.", features:["Folic Acid","Iron","DHA"]},
        "CPF-ELD-001": {sku:"CPF-ELD-001", title:"Elderly — Calcium + Vitamin D", desc:"Helps maintain bone strength and mobility.", features:["Calcium 500mg","Vitamin D3 800IU"]},
        "CPF-IMM-001": {sku:"CPF-IMM-001", title:"Immune — Vitamin C + Zinc", desc:"Rapid immune support.", features:["Vitamin C 500mg","Zinc 10–15mg"]}
      };
      const p = products[sku];
      if(!p) return;
      // adjust language fields if Somali preference
      const lang = localStorage.getItem('cleritas-lang') || 'en';
      if(lang === 'so'){
        // minimal translation mapping
        p.title = (p.sku === 'CPF-W-001') ? 'Haween — Bir 60mg + Folic' : p.title;
        p.desc = (p.sku === 'CPF-W-001') ? 'Taageero bir maalinle ah haweenka da\'da taranka.' : p.desc;
      }
      openModal(p);
    });
  });
  // modal close handlers
  qsa('.modal-close').forEach(b => b.addEventListener('click', closeModal));
  modal?.addEventListener('click', (ev)=>{ if(ev.target.classList.contains('modal-backdrop')) closeModal(); });

  // ORDER PAGE: prefill SKU from query param if present
  function getQueryParam(name){
    try{ const url = new URL(window.location.href); return url.searchParams.get(name); }catch(e){return null;}
  }
  const sku = getQueryParam('sku');
  const productSelect = qs('#product-select');
  if(sku && productSelect){
    productSelect.value = sku;
    setTimeout(()=> productSelect.scrollIntoView({behavior:'smooth', block:'center'}), 250);
  }

  // order form client-side behavior (order.html)
  const orderForm = qs('#order-form');
  const orderConfirm = qs('#order-confirm');
  if(orderForm){
    orderForm.addEventListener('submit', (ev)=>{
      // allow Formspree to submit; just show immediate message
      orderConfirm.style.display = '';
      orderConfirm.textContent = (localStorage.getItem('cleritas-lang') === 'so') ? 'Dalabkaaga waa la dirayaa — fadlan sug xaqiijin.' : 'Your order is being submitted — please wait for confirmation.';
    });
    qs('#reset-btn')?.addEventListener('click', ()=> orderForm.reset());
    qs('#reset-btn-so')?.addEventListener('click', ()=> orderForm.reset());
  }

})();
