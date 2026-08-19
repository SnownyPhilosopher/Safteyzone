(function () {
  var _dead = false, _inited = false, _raf = null, _triggers = null, lenis = null;

  function wait(n) {
    if (window.gsap && window.ScrollTrigger) return init();
    if (n > 120) return;
    setTimeout(function () { wait(n + 1); }, 60);
  }


  function init() {
    if (_inited || _dead) return;
    _inited = true;
    const gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    const preexisting = new Set(ST.getAll());
    const $ = s => Array.from(document.querySelectorAll(s));
    const one = s => document.querySelector(s);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = 'power3.out';

    // decorative off-states are always safe (invisible if JS stalls)
    gsap.set('[data-szo-fill]', { yPercent: 101, opacity: 1 });
    gsap.set('[data-szo-progress]', { scaleX: 0, opacity: 1, transformOrigin: 'left center' });
    gsap.set('[data-szo-servicebar]', { scaleX: 0, opacity: 1, transformOrigin: 'left center' });

    // content is authored VISIBLE: only hide it when motion can actually run
    const animate = !reduced && document.visibilityState === 'visible';
    if (animate) {
      gsap.set('[data-szo-line]', { yPercent: 110 });
      gsap.set('[data-szo-mask]', { yPercent: 110 });
    }

    if (!reduced && window.Lenis) {
      const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
      lenis = lenis;
      lenis.on('scroll', ST.update);
      _raf = t => { if (_dead) return; try { lenis.raf(t * 1000); } catch (e) { gsap.ticker.remove(_raf); } };
      gsap.ticker.add(_raf);
      gsap.ticker.lagSmoothing(0);
      $('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const t = one(a.getAttribute('href'));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.25 }); }
      }));
    }

    // read progress
    gsap.to('[data-szo-progress]', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });

    // hero entrance — watchdog jumps to the end state if the ticker never advances
    const heroTl = gsap.timeline({ delay: 0.15, paused: !animate })
      .fromTo('[data-szo-hero="tag"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease }, 0)
      .to('[data-szo-line]', { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.08 }, 0.12)
      .fromTo('[data-szo-hero="btn"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease }, 0.7)
      .fromTo('[data-szo-cell]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.07 }, 0.85)
      .fromTo('[data-szo-heroimg]', { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0);

    if (!animate) heroTl.progress(1);
    const startFrame = gsap.ticker.frame;
    setTimeout(() => {
      if (_dead) return;
      if (gsap.ticker.frame === startFrame || heroTl.progress() === 0) {
        heroTl.progress(1).pause();
        gsap.set('[data-szo-line], [data-szo-mask]', { yPercent: 0 });
      }
    }, 1400);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && heroTl.progress() === 0 && !_dead) heroTl.play();
    });

    gsap.to('[data-szo-heroimg]', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
    });

    // capability ticker
    const ticker = one('[data-szo-ticker]');
    if (ticker && !reduced) gsap.to(ticker, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });

    // generic reveals + masked headings (skipped entirely when motion is off, so content stays visible)
    if (animate) {
      $('[data-szo-reveal]').forEach(el => gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.95, ease, scrollTrigger: { trigger: el, start: 'top 90%' }
      }));
      $('[data-szo-mask]').forEach(el => gsap.to(el, {
        yPercent: 0, duration: 1.15, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' }
      }));
      $('[data-szo-about]').forEach(el => gsap.fromTo(el, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease, scrollTrigger: { trigger: el, start: 'top 88%' }
      }));
      $('[data-szo-stat]').forEach((el, i) => gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.95, ease, delay: i * 0.08,
        scrollTrigger: { trigger: el, start: 'top 90%' }
      }));
    }

    // parallax
    $('[data-szo-parallax]').forEach(el => {
      const amt = parseFloat(el.dataset.szoParallax) || 0.1;
      gsap.fromTo(el, { yPercent: -amt * 100 }, {
        yPercent: amt * 100, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // services: sequential lines + gold rule draw + sticky frame crossfade
    const labels = ['Guard Services', 'Infrastructure', 'Escort Services', 'Rapid Response'];
    const frames = $('[data-szo-frame]');
    const idxEl = one('[data-szo-frameindex]');
    const labelEl = one('[data-szo-framelabel]');
    let active = 0;
    const setFrame = i => {
      if (i === active) return;
      active = i;
      frames.forEach((f, n) => gsap.to(f, { opacity: n === i ? 1 : 0, duration: 0.7, ease: 'power2.inOut' }));
      if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
      if (labelEl) {
        gsap.fromTo(labelEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease });
        labelEl.textContent = labels[i];
      }
    };

    $('[data-szo-service]').forEach(item => {
      const i = Number(item.dataset.szoService);
      const lines = item.querySelectorAll('[data-szo-sline]');
      const bar = item.querySelector('[data-szo-servicebar]');
      if (animate) {
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 82%' } })
          .to(bar, { scaleX: 1, duration: 1.1, ease }, 0)
          .fromTo(lines, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease, stagger: 0.06 }, 0.05);
      } else {
        gsap.set(bar, { scaleX: 1 });
      }
      ST.create({
        trigger: item, start: 'top 60%', end: 'bottom 60%',
        onEnter: () => setFrame(i), onEnterBack: () => setFrame(i)
      });
    });

    $('[data-szo-count]').forEach(el => {
      const target = Number(el.dataset.szoCount);
      const suffix = el.dataset.szoSuffix || '';
      if (!animate) { el.textContent = target + suffix; return; }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 2.1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        onComplete: () => { el.textContent = target + suffix; }
      });
    });

    // locations: horizontal rail scrubbed by a pinned section
    const rail = one('[data-szo-rail]');
    const track = one('[data-szo-railtrack]');
    if (rail && track && window.innerWidth > 1000) {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: rail, start: 'top top', end: () => '+=' + (dist() + window.innerHeight * 0.4),
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      $('[data-szo-loc]').forEach(card => {
        card.addEventListener('mouseenter', () => gsap.to(card, { backgroundColor: '#0F1215', duration: 0.4, ease }));
        card.addEventListener('mouseleave', () => gsap.to(card, { backgroundColor: '#08090B', duration: 0.4, ease }));
      });
    }

    // clients marquee
    const mq = one('[data-szo-marquee]');
    if (mq && !reduced) {
      gsap.to(mq, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
      mq.querySelectorAll('img').forEach(img => {
        img.addEventListener('mouseenter', () => gsap.to(img, { filter: 'grayscale(0%)', opacity: 1, duration: 0.4 }));
        img.addEventListener('mouseleave', () => gsap.to(img, { filter: 'grayscale(100%)', opacity: 0.45, duration: 0.4 }));
      });
    }

    // nav
    const nav = one('[data-szo-nav]');
    const logo = one('[data-szo-logo]');
    ST.create({
      start: 'top -60', end: 99999,
      onUpdate: self => {
        const on = self.scroll() > 60;
        nav.style.background = on ? 'rgba(8,9,11,.86)' : 'transparent';
        nav.style.backdropFilter = on ? 'blur(14px)' : 'none';
        nav.style.padding = on ? '12px 0' : '20px 0';
        nav.style.borderBottom = on ? '1px solid rgba(255,255,255,.1)' : '1px solid transparent';
        if (logo) logo.style.height = on ? '40px' : '52px';
      }
    });
    $('[data-szo-tab]').forEach(t => {
      t.addEventListener('mouseenter', () => gsap.to(t, { borderColor: 'rgba(217,165,76,.55)', color: '#D9A54C', duration: 0.35, ease }));
      t.addEventListener('mouseleave', () => gsap.to(t, { borderColor: 'rgba(0,0,0,0)', color: '#F5F4F2', duration: 0.35, ease }));
    });

    // button wipes
    $('[data-szo-fill]').forEach(fill => {
      const btn = fill.parentElement;
      btn.addEventListener('mouseenter', () => gsap.to(fill, { yPercent: 0, duration: 0.5, ease }));
      btn.addEventListener('mouseleave', () => gsap.to(fill, { yPercent: 101, duration: 0.45, ease: 'power2.in' }));
    });

    // cursor + magnetics
    if (!reduced && matchMedia('(pointer: fine)').matches) {
      const ring = one('[data-szo-cursor="ring"]');
      gsap.set(ring, { opacity: 1 });
      const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
      window.addEventListener('mousemove', e => { rx(e.clientX); ry(e.clientY); });
      $('[data-szo-magnetic]').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(ring, { scale: 2, borderColor: 'rgba(217,165,76,.95)', duration: 0.4, ease }));
        el.addEventListener('mouseleave', () => {
          gsap.to(ring, { scale: 1, borderColor: 'rgba(217,165,76,.6)', duration: 0.4, ease });
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        });
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.18,
            y: (e.clientY - (r.top + r.height / 2)) * 0.26,
            duration: 0.5, ease
          });
        });
      });
    }

    _triggers = ST.getAll().filter(t => !preexisting.has(t));
    ST.refresh();
  }



  document.addEventListener('DOMContentLoaded', function () { wait(0); });
  window.addEventListener('beforeunload', function () {
    _dead = true;
    if (_raf && window.gsap) window.gsap.ticker.remove(_raf);
    if (_triggers) _triggers.forEach(function (t) { t.kill(); });
    if (lenis) lenis.destroy();
  });
})();
