/* Cleritas site JS: language toggle, banner, prefill query on order page */
(function(){
  const enBtn = document.getElementById('lang-en');
  const soBtn = document.getElementById('lang-so');
  const year = document.getElementById('year');
  const banner = document.getElementById('top-banner');
  const bannerClose = document.getElementById('banner-close');

  if(year) year.textContent = new Date().getFullYear();

  function setLang(lang){
    document.querySelectorAll('[data-en]').forEach(n => n.style.display = (lang==='en') ? '' : 'none');
    document.querySelectorAll('[data-so]').forEach(n => n.style.display = (lang==='so') ? '' : 'none');
    document.querySelectorAll('.lang').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = (lang === 'so') ? 'so' : 'en';
    localStorage.setItem('cleritas-lang', lang);
  }

  enBtn?.addEventListener('click', ()=> setLang('en'));
  soBtn?.addEventListener('click', ()=> setLang('so'));

  const pref = localStorage.getItem('cleritas-lang') || 'en';
  setLang(pref);

  bannerClose?.addEventListener('click', ()=> { banner.style.display='none'; localStorage.setItem('cleritas-banner','closed'); });
  if(localStorage.getItem('cleritas-banner') === 'closed') banner.style.display='none';

  // Order page: prefill SKU from query string if provided
  function qs(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  const sku = qs('sku');
  if(sku){
    const sel = document.getElementById('product-select');
    if(sel){
      sel.value = sku;
      // scroll to form
      setTimeout(()=> sel.scrollIntoView({behavior:'smooth', block:'center'}), 300);
    }
  }

  // order page client-side simple validation + message (optional)
  const orderForm = document.getElementById('order-form');
  const orderConfirm = document.getElementById('order-confirm');
  orderForm?.addEventListener('submit', (ev)=>{
    // let Formspree handle the submission; show an immediate friendly message
    orderConfirm.style.display = '';
    orderConfirm.textContent = (localStorage.getItem('cleritas-lang') === 'so') ? 'Dalabkaaga ayaa la dirayaa — fadlan sug xaqiijin email.' : 'Your order is being submitted — please wait for confirmation email.';
  });

  document.getElementById('order-reset')?.addEventListener('click', ()=> orderForm.reset());
  document.getElementById('order-reset-so')?.addEventListener('click', ()=> orderForm.reset());

})();
