// simple language toggle
(function(){
  const enBtn = document.getElementById('lang-en');
  const soBtn = document.getElementById('lang-so');
  const year = document.getElementById('year');
  year.textContent = new Date().getFullYear();

  function setLang(lang){
    document.querySelectorAll('[data-en]').forEach(n => n.style.display = (lang==='en') ? '' : 'none');
    document.querySelectorAll('[data-so]').forEach(n => n.style.display = (lang==='so') ? '' : 'none');
    enBtn.classList.toggle('active', lang==='en');
    soBtn.classList.toggle('active', lang==='so');
    // set html lang
    document.documentElement.lang = (lang === 'so') ? 'so' : 'en';
  }

  enBtn.addEventListener('click', () => setLang('en'));
  soBtn.addEventListener('click', () => setLang('so'));

  // remember preference in localStorage
  const pref = localStorage.getItem('cleritas-lang') || 'en';
  setLang(pref);
  [enBtn, soBtn].forEach(b => b.addEventListener('click', () => localStorage.setItem('cleritas-lang', b.dataset.lang)));
})();
