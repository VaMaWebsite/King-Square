/* ============================================================
   VAMA — Premium digital byrå
   Vanilla JS: nav, cursor, magnetics, GSAP reveals, Three.js hero,
   process line, counters, testimonials, contact form.
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- preloader ---------------- */
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add('done');
    document.body.classList.remove('is-loading');
    runHeroIntro();
  };
  window.addEventListener('load', () => setTimeout(hidePreloader, reduced ? 150 : 1700));
  setTimeout(hidePreloader, 3600); // safety net if load never fires

  /* ---------------- scroll progress bar ---------------- */
  const progressBar = document.getElementById('progressBar');
  let ticking = false;
  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    header.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  }
  const header = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------- cursor glow ---------------- */
  const cursor = document.getElementById('cursorGlow');
  if (cursor && hasFinePointer) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('active');
    });
    document.querySelectorAll('a, button, .magnetic, .project-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
    (function tick() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(tick);
    })();
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
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
  }

  /* ---------------- smooth anchor scroll w/ header offset ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- active section indicator ---------------- */
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = ['om', 'tjanster', 'portfolio', 'process', 'omdomen', 'kontakt']
    .map(id => document.getElementById(id));
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && navObs.observe(s));

  /* ---------------- magnetic buttons ---------------- */
  if (hasFinePointer && !reduced) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = 22;
      const moveX = hasGSAP ? gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }) : null;
      const moveY = hasGSAP ? gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }) : null;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width * strength;
        const dy = (e.clientY - r.top - r.height / 2) / r.height * strength;
        if (moveX) { moveX(dx); moveY(dy); } else { el.style.transform = `translate(${dx}px,${dy}px)`; }
      });
      el.addEventListener('mouseleave', () => {
        if (moveX) { moveX(0); moveY(0); } else { el.style.transform = ''; }
      });
    });
  }

  /* ---------------- service card pointer glow ---------------- */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ---------------- GSAP scroll reveals ---------------- */
  function initReveals() {
    const items = gsap.utils.toArray('.reveal');
    if (!items.length) return;
    items.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------------- hero intro timeline ---------------- */
  function runHeroIntro() {
    if (!hasGSAP) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal-ready'));
      return;
    }
    const words = document.querySelectorAll('.hero-copy h1 .word');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(words, { yPercent: 130, opacity: 0, filter: 'blur(10px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.045 })
      .fromTo('.hero-copy .eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7 }, 0)
      .fromTo('.hero-copy .lead', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8 }, '-=0.7')
      .fromTo('.hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8 }, '-=0.6')
      .fromTo('.hero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8 }, '-=0.6')
      .fromTo('.hero-stage', { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: 1.2 }, 0.15);

    initReveals();
    initProcessLine();
    initStats();
  }

  /* ---------------- process timeline fill ---------------- */
  function initProcessLine() {
    const fill = document.getElementById('processFill');
    if (!fill) return;
    gsap.to(fill, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: '.process-list', start: 'top 70%', end: 'bottom 80%', scrub: 0.6 }
    });
    document.querySelectorAll('.process-step').forEach(step => {
      ScrollTrigger.create({
        trigger: step, start: 'top 60%', end: 'bottom 60%',
        onEnter: () => step.classList.add('active'),
        onLeaveBack: () => step.classList.remove('active')
      });
    });
  }

  /* ---------------- animated stat counters ---------------- */
  function initStats() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      if (reduced) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = obj.v.toFixed(decimals) + suffix; }
          });
        }
      });
    });
  }

  /* ---------------- testimonials carousel ---------------- */
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
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      restart();
    }
    function restart() {
      clearInterval(timer);
      if (reduced) return;
      timer = setInterval(() => goTo(index + 1), 6000);
    }
    document.getElementById('tPrev').addEventListener('click', () => goTo(index - 1));
    document.getElementById('tNext').addEventListener('click', () => goTo(index + 1));
    const stage = document.querySelector('.t-stage');
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', restart);
    render();
    restart();
  }

  /* ---------------- contact form ---------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const success = document.getElementById('contactSuccess');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      document.getElementById('successName').textContent = document.getElementById('cName').value;
      success.classList.add('show');
      form.querySelector('button[type="submit"]').setAttribute('disabled', 'true');
      success.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ============================================================
     THREE.JS HERO SCENE
     ============================================================ */
  function initHeroScene() {
    const stageEl = document.getElementById('heroStage');
    const canvas = document.getElementById('heroCanvas');
    if (!stageEl || !canvas || typeof THREE === 'undefined') { if (stageEl) stageEl.classList.add('no-webgl'); return; }

    let renderer, scene, camera, group, particles, raf;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
      stageEl.classList.add('no-webgl');
      return;
    }

    const getSize = () => {
      const r = stageEl.getBoundingClientRect();
      return { w: Math.max(r.width, 1), h: Math.max(r.height, 1) };
    };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const { w, h } = getSize();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.PointLight(0x7cc8ff, 1.4, 30);
    key.position.set(4, 3, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0xffffff, 0.9, 30);
    rim.position.set(-5, -3, -3);
    scene.add(rim);

    group = new THREE.Group();
    scene.add(group);

    // Outer wireframe icosahedron
    const wireGeo = new THREE.IcosahedronGeometry(1.95, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x2f8fd1, wireframe: true, transparent: true, opacity: 0.45 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Inner glass-like sphere
    const glassGeo = new THREE.SphereGeometry(1.32, 64, 64);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf6ff, transparent: true, opacity: 0.35, roughness: 0.12, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.1, reflectivity: 0.6
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    group.add(glassMesh);

    // Small orbiting accent spheres
    const accentGeo = new THREE.SphereGeometry(0.09, 20, 20);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x7cc8ff, emissive: 0x1c5f8f, emissiveIntensity: 0.4, roughness: 0.3 });
    const orbiters = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(accentGeo, accentMat);
      const radius = 2.5 + i * 0.35;
      orbiters.push({ mesh: m, radius, speed: 0.25 + i * 0.08, offset: i * 2.1 });
      group.add(m);
    }

    // Ambient particle field
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 3.4 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x8fd3ff, size: 0.035, transparent: true, opacity: 0.6, sizeAttenuation: true });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    if (hasFinePointer && !reduced) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    const clock = new THREE.Clock();
    let visible = true;

    function renderFrame() {
      const t = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      if (!reduced) {
        group.rotation.y = t * 0.12 + targetX * 0.35;
        group.rotation.x = t * 0.05 + targetY * 0.22;
        particles.rotation.y = t * 0.02;
        orbiters.forEach(o => {
          const a = t * o.speed + o.offset;
          o.mesh.position.set(Math.cos(a) * o.radius, Math.sin(a * 0.8) * o.radius * 0.6, Math.sin(a) * o.radius);
        });
      }
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(renderFrame);
    }

    function start() {
      if (raf || reduced) { renderFrame(); return; }
      renderFrame();
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visible = entry.isIntersecting;
        if (visible && document.visibilityState === 'visible') start(); else stop();
      });
    }, { threshold: 0.05 });
    io.observe(stageEl);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && visible) start(); else stop();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const size = getSize();
        renderer.setSize(size.w, size.h, false);
        camera.aspect = size.w / size.h;
        camera.updateProjectionMatrix();
        if (reduced) renderer.render(scene, camera);
      }, 120);
    });

    start();
  }

  document.addEventListener('DOMContentLoaded', initHeroScene);
})();
