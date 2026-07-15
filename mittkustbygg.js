/* ============================================================
   MITTKUST BYGG — vanilla JS
   nav, reveals, projekt-lightbox, processlinje, räknare,
   omdömeskarusell, kontaktformulär
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- navbar + to-top ---------------- */
  const header = document.getElementById('siteNav');
  const toTop = document.getElementById('toTop');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

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

  /* ---------------- smooth anchor scroll w/ header offset ---------------- */
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
  const sections = ['hem', 'tjanster', 'projekt', 'om', 'kontakt'].map(id => document.getElementById(id));
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
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    if (reduced) el.classList.add('in'); else revealObs.observe(el);
  });

  /* ---------------- process step activation ---------------- */
  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .5 });
  document.querySelectorAll('.process-step').forEach(el => stepObs.observe(el));

  /* ---------------- animated counters ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); } });
  }, { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => {
    if (reduced) el.textContent = el.dataset.count + (el.dataset.suffix || '');
    else countObs.observe(el);
  });

  /* ---------------- project lightbox ---------------- */
  const cards = Array.from(document.querySelectorAll('#projectGrid .project-card'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbMeta = document.getElementById('lbMeta');
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = (i + cards.length) % cards.length;
    const card = cards[lbIndex];
    lbImg.style.background = getComputedStyle(card.querySelector('.thumb .ph')).backgroundImage;
    lbTitle.textContent = card.dataset.title || '';
    lbMeta.textContent = card.dataset.meta || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
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

  /* ---------------- testimonial carousel ---------------- */
  const track = document.getElementById('tTrack');
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById('tDots');
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
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(() => goTo(index + 1), 6000); }
    document.getElementById('tPrev').addEventListener('click', () => goTo(index - 1));
    document.getElementById('tNext').addEventListener('click', () => goTo(index + 1));
    const stage = document.querySelector('.t-stage');
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
