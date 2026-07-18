/* ============================================================
   Åberg & Söner Måleri — animationslager (GSAP)
   1. Maskerad typografi-ingång (JS-raddelning + slide-up)
   2. Mus-parallax på stora bildblock
   3. Penseldrags-hovring (SVG-linje som ritas ut)
   4. Kontaktsektions-trigger (staggrad entré med back.out)
   + navrygg, före/efter-reglage, scrollavslöjanden
   Layouten lämnas orörd — allt här är rörelse ovanpå den.
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ================================================================
     1. MASKERAD TYPOGRAFI-INGÅNG
     Delar upp herorubriken i rader via JS, gömmer varje rad bakom
     en overflow-hidden-mask och låter dem glida upp ur "springan".
     ================================================================ */

  // Delar ett element i visuella rader. Ord mäts på plats (offsetTop)
  // och grupperas per rad; inline-element som <em> hålls intakta.
  function splitToLines(el) {
    // Redan förberedda masker i HTML? Använd dem.
    const preSplit = el.querySelectorAll('.line-mask > span');
    if (preSplit.length) return Array.from(preSplit);

    const units = [];
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
          const s = document.createElement('span');
          s.textContent = word;
          units.push(s);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        units.push(node.cloneNode(true)); // t.ex. <em>konstverk.</em>
      }
    });

    el.textContent = '';
    units.forEach((u, i) => {
      u.style.display = 'inline-block';
      el.appendChild(u);
      if (i < units.length - 1) el.appendChild(document.createTextNode(' '));
    });

    // Gruppera per rad utifrån vertikal position
    const lines = [];
    let currentTop = null;
    units.forEach((u) => {
      if (u.offsetTop !== currentTop) { currentTop = u.offsetTop; lines.push([]); }
      lines[lines.length - 1].push(u);
    });

    // Bygg mask (overflow hidden) + inre rad-span
    el.textContent = '';
    return lines.map((words) => {
      const mask = document.createElement('span');
      mask.className = 'line-mask';
      const inner = document.createElement('span');
      words.forEach((w, i) => {
        inner.appendChild(w);
        if (i < words.length - 1) inner.appendChild(document.createTextNode(' '));
      });
      mask.appendChild(inner);
      el.appendChild(mask);
      return inner;
    });
  }

  if (hasGSAP && !reduced) {
    // Dolda startlägen aktiveras först nu — utan GSAP förblir allt synligt
    document.documentElement.classList.add('js-anim');
    gsap.registerPlugin(ScrollTrigger);

    const heroLines = splitToLines(document.querySelector('h1'));

    const intro = gsap.timeline();
    intro
      .fromTo(heroLines,
        // y:0 nollar CSS-startlägets translateY(115%) som GSAP annars
        // tolkar som ett kvarliggande pixel-offset utanför masken
        { yPercent: 115, y: 0, autoAlpha: 0 },
        { yPercent: 0, y: 0, autoAlpha: 1, duration: 1.5, ease: 'power4.out', stagger: 0.15 },
        0.5) // första raden startar 0.5s efter DOM ready
      .to('.fade-item', { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.09 }, 0.9);

    /* ---- generella scrollavslöjanden (allt utom kontaktsektionen) ---- */
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    /* ---- diskret scroll-parallax på herobilden ---- */
    gsap.to('#heroImage', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '#heroImage', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    /* ================================================================
       4. KONTAKTSEKTIONS-TRIGGER
       Mörka panelen tänds upp nerifrån, rubriksidan glider in från
       vänster, kontaktuppgifterna staggrat från höger — back.out.
       ================================================================ */
    const panel = document.querySelector('[data-contact-panel]');
    if (panel) {
      const left = panel.querySelector('[data-contact-left]');
      const items = panel.querySelectorAll('[data-contact-item]');

      gsap.set(panel, { y: 90, autoAlpha: 0, scale: 0.97 });
      gsap.set(left, { x: -60, autoAlpha: 0 });
      gsap.set(items, { x: 60, autoAlpha: 0 });

      gsap.timeline({
        scrollTrigger: { trigger: '#kontakt', start: 'top 72%', once: true }
      })
        .to(panel, { y: 0, autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out' })
        .to(left, { x: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.55')
        .to(items, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.12 }, '-=0.65');
    }

    // Mät om triggerpositioner när typsnitt och stilar landat
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ================================================================
     2. MUS-PARALLAX PÅ BILDER
     Alla stora bildblock driver några pixlar i MOTSATT riktning
     mot musen. quickTo + lång duration ger tyngd utan skakighet.
     ================================================================ */
  if (hasGSAP && !reduced && finePointer) {
    const layers = [
      { el: document.getElementById('heroImage'), depth: 15 },
      ...gsap.utils.toArray('.ba-frame').map((el) => ({ el, depth: 10 }))
    ].filter((l) => l.el);

    layers.forEach((l) => {
      l.toX = gsap.quickTo(l.el, 'x', { duration: 0.9, ease: 'power2.out' });
      l.toY = gsap.quickTo(l.el, 'y', { duration: 0.9, ease: 'power2.out' });
    });

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;  // -1 … 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      layers.forEach((l) => {
        l.toX(-nx * l.depth); // motsatt riktning
        l.toY(-ny * l.depth);
      });
    }, { passive: true });
  }

  /* ================================================================
     3. PENSELDRAGS-HOVRING
     En organisk SVG-linje injiceras under varje textlänk och ritas
     ut vänster→höger via stroke-dashoffset. Vid mouseleave fortsätter
     draget ut åt höger — som en pensel som lyfter från ytan.
     ================================================================ */
  if (hasGSAP && !reduced && finePointer) {
    document.querySelectorAll('.link-brush').forEach((link) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'brush-svg');
      svg.setAttribute('viewBox', '0 0 120 9');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M2 6.5 Q 22 3.5 42 5.5 T 80 4.5 Q 100 3.8 118 5.8');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-linecap', 'round');
      // Varierande tjocklek går inte på en path — två pass ger penselkänsla
      path.setAttribute('stroke-width', '2.4');
      svg.appendChild(path);
      link.appendChild(svg);

      const len = path.getTotalLength();
      // Gapet görs mycket längre än sträckan så att varken den rundade
      // ändpunkten eller nästa dash-cykel skymtar i vila
      gsap.set(path, { strokeDasharray: `${len} ${len * 3}`, strokeDashoffset: len + 2 });

      link.addEventListener('mouseenter', () => {
        gsap.killTweensOf(path);
        gsap.fromTo(path,
          { strokeDashoffset: len + 2 },
          { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.killTweensOf(path);
        gsap.to(path, {
          strokeDashoffset: -(len + 2), duration: 0.45, ease: 'power2.in',
          onComplete: () => gsap.set(path, { strokeDashoffset: len + 2 })
        });
      });
    });
  }

  /* ================================================================
     Menyn får rygg när man scrollar
     ================================================================ */
  const nav = document.getElementById('siteNav');
  const onScroll = () => {
    const scrolled = window.scrollY > 24;
    nav.classList.toggle('bg-paper/85', scrolled);
    nav.classList.toggle('backdrop-blur-md', scrolled);
    nav.classList.toggle('shadow-[0_1px_0_rgba(26,26,26,.08)]', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ================================================================
     Före/Efter-reglage: dra med pekare eller styr med piltangenter
     ================================================================ */
  document.querySelectorAll('.ba-frame').forEach((frame) => {
    const setSplit = (clientX) => {
      const rect = frame.getBoundingClientRect();
      const pct = Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100));
      frame.style.setProperty('--split', pct + '%');
    };

    let dragging = false;
    frame.addEventListener('pointerdown', (e) => {
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      setSplit(e.clientX);
    });
    frame.addEventListener('pointermove', (e) => { if (dragging) setSplit(e.clientX); });
    frame.addEventListener('pointerup', () => { dragging = false; });
    frame.addEventListener('pointercancel', () => { dragging = false; });

    frame.setAttribute('tabindex', '0');
    frame.setAttribute('role', 'slider');
    frame.setAttribute('aria-label', 'Jämför före och efter');
    frame.addEventListener('keydown', (e) => {
      const current = parseFloat(getComputedStyle(frame).getPropertyValue('--split')) || 50;
      if (e.key === 'ArrowLeft') { frame.style.setProperty('--split', Math.max(4, current - 4) + '%'); e.preventDefault(); }
      if (e.key === 'ArrowRight') { frame.style.setProperty('--split', Math.min(96, current + 4) + '%'); e.preventDefault(); }
    });
  });
})();
