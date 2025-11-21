// Cleritas Pharma - main JS
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // ---------- YEAR ----------
  const yearEl = qs('#year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- LANGUAGE TOGGLE ----------
  const LANG_KEY = 'cleritas-lang';
  const translations = {
    "CPF-W-001": {so:{title:"Haween — Bir 60mg + Folic", desc:"Taageero ferro maalinle ah haweenka da'da uurka."}},
    "CPF-M-001": {so:{title:"Rag — B-Complex + Zinc", desc:"Wuxuu taageeraa tamarta iyo soo kabashada."}},
    "CPF-K-001": {so:{title:"Carruur — Multivitamin Syrup", desc:"Taageero koboc & difaac — syrup ama kiniin la nuugo."}},
    "CPF-PREN-001": {so:{title:"Uurka — Dhammaystiran", desc:"Taageerada kahor uurka iyo inta lagu jiro uurka."}},
    "CPF-ELD-001": {so:{title:"Waayeel — Kalsiyam + Vitamin D", desc:"Waxay ka caawisaa ilaalinta xoogga lafaha iyo dhaqdhaqaaqa."}},
    "CPF-IMM-001": {so:{title:"Difaac — Vitamin C + Zinc", desc:"Taageero difaac degdeg ah."}}
  };

  function setLang(lang){
    qsa('[data-en]').forEach(el => el.style.display = (lang==='en')?'':'none');
    qsa('[data-so]').forEach(el => el.style.display = (lang==='so')?'':'none');
    qsa('.lang').forEach(b => b.classList.toggle('active', b.dataset.lang===lang));
    document.documentElement.lang = lang==='so'?'so':'en';
    localStorage.setItem(LANG_KEY, lang);
  }

  qsa('.lang').forEach(b => b.addEventListener('click', ()=> setLang(b.dataset.lang)));
  setLang(localStorage.getItem(LANG_KEY) || 'en');

  // ---------- TOP BANNER ----------
  const banner = qs('#top-banner');
  const bannerClose = qs('#banner-close');
  bannerClose?.addEventListener('click', ()=>{
    banner.style.display = 'none';
    localStorage.setItem('cleritas-banner','closed');
  });
  if(localStorage.getItem('cleritas-banner')==='closed' && banner) banner.style.display='none';

  // ---------- PRODUCT QUICK-VIEW MODAL ----------
  let modal = qs('#product-modal');
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function trapFocus(el){
    const focusEls = Array.from(el.querySelectorAll(focusable));
    if(!focusEls.length) return;
    const first = focusEls[0], last = focusEls[focusEls.length-1];
    el.addEventListener('keydown', e=>{
      if(e.key==='Tab'){
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  function openModal(data){
    if(!modal) return;
    modal.style.display = '';
    modal.setAttribute('aria-hidden','false');

    const lang = localStorage.getItem(LANG_KEY) || 'en';
    const t = translations[data.sku];
    const title = (lang==='so' && t?.so?.title) ? t.so.title : data.title;
    const desc = (lang==='so' && t?.so?.desc) ? t.so.desc : data.desc;

    modal.querySelector('.m-title').textContent = title;
    modal.querySelector('.m-sku').textContent = `SKU: ${data.sku || ''}`;
    modal.querySelector('.m-desc').textContent = desc;

    const feat = modal.querySelector('.m-feat');
    feat.innerHTML = '';
    (data.features || []).forEach(f=>{
      const li = document.createElement('li'); li.textContent = f; feat.appendChild(li);
    });

    modal.querySelector('.modal-order').href = `order.html?sku=${encodeURIComponent(data.sku)}`;
    trapFocus(modal.querySelector('.modal-panel'));
    modal.querySelector('.modal-panel').focus();
  }

  function closeModal(){ 
    if(modal){ 
      modal.style.display='none'; 
      modal.setAttribute('aria-hidden','true'); 
    } 
  }

  qsa('.view-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
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
      openModal(p);
    });
  });

  qsa('.modal-close').forEach(b=>b.addEventListener('click', closeModal));
  modal?.addEventListener('click', e=>{ if(e.target.classList.contains('modal-backdrop')) closeModal(); });

  // ---------- ORDER PAGE PREFILL ----------
  function getQueryParam(name){
    try{ const url = new URL(window.location.href); return url.searchParams.get(name); } catch(e){ return null; }
  }
  const sku = getQueryParam('sku');
  const productSelect = qs('#product-select');
  if(sku && productSelect){
    productSelect.value = sku;
    setTimeout(()=> productSelect.scrollIntoView({behavior:'smooth', block:'center'}), 250);
  }

  // ---------- ORDER FORM SUBMISSION VIA RESEND ----------
  const orderForm = qs('#order-form');
  const orderConfirm = qs('#order-confirm');
  if(orderForm){
    orderForm.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const submitBtn = orderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      orderConfirm.style.display = '';
      orderConfirm.textContent = (localStorage.getItem(LANG_KEY)==='so') ? 
        'Dalabkaaga waa la dirayaa — fadlan sug xaqiijin.' :
        'Your order is being submitted — please wait for confirmation.';

      const formData = Object.fromEntries(new FormData(orderForm).entries());

      try {
        const res = await fetch('https://api.resend.com/send', { // <- replace with your Resend endpoint
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(formData)
        });
        if(res.ok){
          orderConfirm.textContent = (localStorage.getItem(LANG_KEY)==='so') ? 'Dalabkaaga waa la diray!' : 'Your order has been sent!';
          orderForm.reset();
        } else {
          const err = await res.json();
          orderConfirm.textContent = `Error: ${err.message || 'Something went wrong'}`;
        }
      } catch(e){
        orderConfirm.textContent = `Error: ${e.message || 'Network error'}`;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

})();
