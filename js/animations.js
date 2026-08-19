/* =========================================================
SAFETY ZONE — MOTION LAYER
Load order in index.html (replaces AOS):

  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/animations.css">
  ...
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"><\/script>
  <script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"><\/script>
  <script src="js/animations.js"><\/script>

Then delete the AOS <link>, <script> and AOS.init() from js/script.js.
The markup helpers below are injected automatically — no HTML edits required
except the two hero lines noted in HERO SPLIT.
========================================================= */

(function () {
  if (!window.gsap || !window.ScrollTrigger) { console.warn('[sz] GSAP missing'); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'power3.out';
  document.documentElement.classList.add('sz-ready');
  // content is authored visible; only hide it for animation when motion can actually run
  var animate = !reduced && document.visibilityState === 'visible';
  if (animate) document.documentElement.classList.add('sz-anim');

  /* ---------- 1. markup prep ---------- */

  // hero background layer (so it can move independently of the section)
  var hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.sz-hero-bg')) {
    var bg = document.createElement('div');
    bg.className = 'sz-hero-bg';
    hero.insertBefore(bg, hero.firstChild);
    var hint = document.createElement('div');
    hint.className = 'sz-scroll-hint';
    hero.appendChild(hint);
  }

  // HERO SPLIT: mask each hero line so it can rise from behind a cut
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    var sub = heroTitle.querySelector('span');
    var head = (heroTitle.childNodes[0].textContent || '').trim();
    var words = head.split(/\s+/);
    var html = words.map(function (w) {
      return '<span class="sz-mask"><span class="sz-mask-inner sz-hero-line">' + w + '</span></span>';
    }).join('');
    if (sub) html += '<span class="sz-mask" style="margin-top:16px"><span class="sz-mask-inner sz-hero-line">' + sub.innerHTML + '</span></span>';
    heroTitle.innerHTML = html;
    var subEl = heroTitle.querySelector('.sz-mask:last-child .sz-mask-inner');
    if (sub && subEl) {
      subEl.style.cssText += 'font-family:Inter,sans-serif;font-size:clamp(1.05rem,2.2vw,1.6rem);font-weight:300;color:var(--grey);text-transform:none;letter-spacing:0;';
    }
  }
  var tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    var t = tagline.innerHTML;
    tagline.innerHTML = '<span class="sz-mask"><span class="sz-mask-inner sz-hero-line">' + t + '</span></span>';
  }

  // button wipe fills
  $('.hero-btn, .cta-btn, .footer-btn').forEach(function (b) {
    if (b.querySelector('.sz-fill')) return;
    b.innerHTML = '<span class="sz-fill"></span><span class="sz-label">' + b.innerHTML + '</span>';
  });

  // nav link rolls
  $('.nav-link').forEach(function (l) {
    if (l.querySelector('.sz-roll')) return;
    var txt = l.textContent.trim();
    l.style.position = 'relative';
    l.innerHTML = '<span class="sz-roll">' + txt + '</span><span class="sz-roll sz-roll--alt" aria-hidden="true">' + txt + '</span>';
  });

  // service hover wash
  $('.service-item').forEach(function (s) {
    if (s.querySelector('.sz-wash')) return;
    var w = document.createElement('span');
    w.className = 'sz-wash';
    s.insertBefore(w, s.firstChild);
  });

  // location card top line
  $('.location-item').forEach(function (c) {
    if (c.querySelector('.sz-topline')) return;
    var l = document.createElement('span');
    l.className = 'sz-topline';
    c.insertBefore(l, c.firstChild);
  });

  // parallax-safe media wrappers in the about column
  $('.about-images > img').forEach(function (img) {
    var w = document.createElement('div');
    w.className = 'sz-media';
    img.parentNode.insertBefore(w, img);
    w.appendChild(img);
    img.setAttribute('data-sz-parallax', '0.08');
  });
  $('.services-image img').forEach(function (i) { i.setAttribute('data-sz-parallax', '0.14'); });

  // background layers for stats + cta
  [['.stats-section', 0.1], ['.cta-section', 0.12]].forEach(function (pair) {
    var sec = document.querySelector(pair[0]);
    if (!sec || sec.querySelector('.sz-bg')) return;
    var b = document.createElement('div');
    b.className = 'sz-bg';
    b.setAttribute('data-sz-parallax', String(pair[1]));
    sec.insertBefore(b, sec.firstChild);
    if (pair[0] === '.stats-section') {
      var tint = document.createElement('div');
      tint.className = 'sz-tint';
      sec.insertBefore(tint, b.nextSibling);
    }
  });

  // client logos -> seamless marquee (duplicated once)
  var cg = document.querySelector('.clients-grid');
  if (cg) {
    var logos = $('.client-logo img', cg).map(function (i) { return i.getAttribute('src'); });
    var track = document.createElement('div');
    track.className = 'sz-marquee';
    track.innerHTML = logos.concat(logos).map(function (src) {
      return '<img src="' + src + '" alt="Client logo">';
    }).join('');
    cg.parentNode.replaceChild(track, cg);
  }

  // reveal targets: anything that used AOS, plus copy blocks
  $('[data-aos], .about-block, .stat-item, .section-title span, .section-title h2, .contact-item, .footer-right')
    .forEach(function (el) { el.classList.add('sz-reveal'); el.removeAttribute('data-aos'); });
  $('.hero [data-aos], .hero-title, .hero-tagline').forEach(function (el) { el.classList.remove('sz-reveal'); });

  // custom cursor nodes
  var dot = document.createElement('div'); dot.className = 'sz-cursor-dot';
  var ring = document.createElement('div'); ring.className = 'sz-cursor-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);

  /* ---------- 2. smooth scroll ---------- */
  if (!reduced && window.Lenis) {
    var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', ST.update);
    var rafCb = function (t) {
      try { lenis.raf(t * 1000); } catch (e) { gsap.ticker.remove(rafCb); }
    };
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener('pagehide', function () { gsap.ticker.remove(rafCb); lenis.destroy(); });
    $('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70, duration: 1.2 }); }
      });
    });
  }

  /* ---------- 3. hero entrance ---------- */
  // percentage transforms set in CSS are invisible to gsap's yPercent — seed them here
  gsap.set('.sz-mask-inner', { yPercent: 110, opacity: 1 });
  gsap.set('.sz-fill', { yPercent: 101 });
  gsap.set('.sz-roll--alt', { yPercent: 100 });
  gsap.set('.sz-wash, .sz-topline', { scaleX: 0, transformOrigin: 'left center' });

  var tl = gsap.timeline({ delay: 0.15, paused: !animate });
  tl.fromTo('.live-tag', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease }, 0)
    .to('.sz-hero-line', { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09 }, 0.15)
    .fromTo('.hero-btn', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease }, 0.6)
    .fromTo('.sz-hero-bg', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0);

  // failsafe: if gsap's ticker never advances (background tab, throttled rAF), jump to the end state
  if (!animate) tl.progress(1);
  var startFrame = gsap.ticker.frame;
  setTimeout(function () {
    if (gsap.ticker.frame === startFrame || tl.progress() === 0) {
      tl.progress(1).pause();
      gsap.set('.sz-mask-inner', { yPercent: 0, opacity: 1 });
      gsap.set('.sz-reveal', { y: 0, opacity: 1 });
      document.documentElement.classList.remove('sz-anim');
    }
  }, 1400);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && tl.progress() === 0) tl.play();
  });

  gsap.to('.sz-hero-bg', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- 4. scroll reveals ---------- */
  if (animate) $('.sz-reveal').forEach(function (el) {
    gsap.fromTo(el, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.95, ease,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  $('[data-sz-parallax]').forEach(function (el) {
    var amt = parseFloat(el.getAttribute('data-sz-parallax')) || 0.1;
    gsap.fromTo(el, { yPercent: -amt * 100 }, {
      yPercent: amt * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- 5. services: sequential line reveals ---------- */
  $('.service-item').forEach(function (item) {
    var lines = $('h4, li', item);
    if (animate) {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 82%' } })
        .fromTo(lines, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease, stagger: 0.07 });
    }
    var wash = item.querySelector('.sz-wash');
    item.addEventListener('mouseenter', function () { gsap.to(wash, { scaleX: 1, duration: 0.7, ease: ease }); });
    item.addEventListener('mouseleave', function () { gsap.to(wash, { scaleX: 0, duration: 0.5, ease: 'power2.in' }); });
  });

  /* ---------- 6. counters ---------- */
  $('.counter').forEach(function (el) {
    var target = Number(el.getAttribute('data-target'));
    if (!animate) { el.textContent = target + '+'; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: function () { el.textContent = Math.round(obj.v); },
      onComplete: function () { el.textContent = target + '+'; }
    });
  });

  /* ---------- 7. location cards ---------- */
  $('.location-item').forEach(function (card, i) {
    var line = card.querySelector('.sz-topline');
    if (!animate) gsap.set(line, { scaleX: 1 });
    else gsap.to(line, {
      scaleX: 1, duration: 1, ease: ease, delay: 0.2 + i * 0.09,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
    card.addEventListener('mouseenter', function () { gsap.to(card, { y: -8, backgroundColor: '#171b1f', duration: 0.45, ease: ease }); });
    card.addEventListener('mouseleave', function () { gsap.to(card, { y: 0, backgroundColor: '#131619', duration: 0.45, ease: ease }); });
  });

  /* ---------- 8. client marquee ---------- */
  var mq = document.querySelector('.sz-marquee');
  if (mq && !reduced) {
    gsap.to(mq, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
    $('img', mq).forEach(function (img) {
      img.addEventListener('mouseenter', function () { gsap.to(img, { filter: 'grayscale(0%)', opacity: 1, duration: 0.4 }); });
      img.addEventListener('mouseleave', function () { gsap.to(img, { filter: 'grayscale(100%)', opacity: 0.5, duration: 0.4 }); });
    });
  }

  /* ---------- 9. nav ---------- */
  var nav = document.querySelector('.navbar');
  var logo = document.querySelector('.navbar-brand img');
  ST.create({
    start: 'top -80', end: 99999,
    onUpdate: function (self) {
      var on = self.scroll() > 80;
      nav.classList.toggle('scrolled', on);
      if (logo) logo.style.height = on ? '46px' : '70px';
    }
  });

  $('.nav-link').forEach(function (link) {
    var spans = $('.sz-roll', link);
    link.addEventListener('mouseenter', function () { gsap.to(spans, { yPercent: -100, duration: 0.45, ease: ease }); });
    link.addEventListener('mouseleave', function () { gsap.to(spans, { yPercent: 0, duration: 0.45, ease: ease }); });
  });

  /* ---------- 10. button wipes ---------- */
  $('.hero-btn, .cta-btn, .footer-btn').forEach(function (btn) {
    var fill = btn.querySelector('.sz-fill');
    var label = btn.querySelector('.sz-label');
    btn.addEventListener('mouseenter', function () {
      gsap.to(fill, { yPercent: 0, duration: 0.5, ease: ease });
      gsap.to(label, { color: '#0B0D0F', duration: 0.3 });
    });
    btn.addEventListener('mouseleave', function () {
      gsap.to(fill, { yPercent: 101, duration: 0.45, ease: 'power2.in' });
    });
  });

  /* ---------- 11. cursor + magnetics ---------- */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    gsap.set([dot, ring], { opacity: 1 });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    window.addEventListener('mousemove', function (e) {
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    });

    $('.hero-btn, .cta-btn, .footer-btn, .footer-social a').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(ring, { scale: 1.9, borderColor: 'rgba(217,165,76,.9)', duration: 0.4, ease: ease });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(ring, { scale: 1, borderColor: 'rgba(217,165,76,.55)', duration: 0.4, ease: ease });
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.22,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.5, ease: ease
        });
      });
    });
  }

  ST.refresh();
})();
