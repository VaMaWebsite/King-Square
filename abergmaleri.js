/* ============================================================
   ÅBERG & SÖNER MÅLERI — vanilla JS
   nav, reveals, projektlightbox, citatkarusell, kontaktformulär
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- navbar ---------------- */
  const header = document.getElementById('siteNav');
  let ticking = false;
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  navToggle.addEventListener('click', () => {
    const open = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  }));

  /* ---------------- smooth anchor scroll ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- active section indicator ---------------- */
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = ['tjanster', 'om', 'projekt', 'kontakt'].map(id => document.getElementById(id));
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && navObs.observe(s));

  /* ---------------- reveals ---------------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    if (reduced) el.classList.add('in'); else revealObs.observe(el);
  });

  /* ---------------- project lightbox ---------------- */
  const tiles = Array.from(document.querySelectorAll('#projectGrid .project-tile'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbMeta = document.getElementById('lbMeta');
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = (i + tiles.length) % tiles.length;
    const tile = tiles[lbIndex];
    lbImg.style.background = getComputedStyle(tile.querySelector('.ph')).backgroundImage;
    lbTitle.textContent = tile.dataset.title || '';
    lbMeta.textContent = tile.dataset.meta || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  tiles.forEach((tile, i) => {
    tile.addEventListener('click', () => openLightbox(i));
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => openLightbox(lbIndex - 1));
  document.getElementById('lbNext').addEventListener('click', () => openLightbox(lbIndex + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
  });

  /* ---------------- quote carousel ---------------- */
  const track = document.getElementById('quoteTrack');
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById('quoteDots');
    let index = 0, timer;
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Visa omdöme ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);
    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) { index = (i + slides.length) % slides.length; render(); restart(); }
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(() => goTo(index + 1), 6500); }
    document.getElementById('quotePrev').addEventListener('click', () => goTo(index - 1));
    document.getElementById('quoteNext').addEventListener('click', () => goTo(index + 1));
    const stage = document.querySelector('.quote-stage');
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', restart);
    render();
    restart();
  }

  /* ---------------- contact form (design concept — no live backend yet) ---------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const success = document.getElementById('contactSuccess');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      document.getElementById('successName').textContent = document.getElementById('cName').value;
      success.classList.add('show');
      success.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
