# Safety Zone — motion layer port

Two files, dropped into your existing project. No HTML restructuring needed.

## 1. Copy the files
- `port/animations.css` -> `css/animations.css`
- `port/animations.js`  -> `js/animations.js`

## 2. In index.html
Remove the AOS stylesheet and script:
```
<link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
```

Add after `css/style.css`:
```
<link rel="stylesheet" href="css/animations.css">
```

Replace the bottom script block with:
```
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
<script src="js/script.js"></script>
<script src="js/animations.js"></script>
```

## 3. In js/script.js
Delete the `AOS.init({...})` call, the navbar scroll listener, the counter block and
the bracket-signature block — `animations.js` owns all four now. Keep the
mobile-menu close handler.

Also remove `scroll-behavior:smooth` from `html{}` in style.css (Lenis handles it).

## What you get
- Hero: masked line-by-line type reveal, 1.12x background scale-down on load, scroll drift, animated scroll hint
- Services: per-item sequential heading + bullet reveals, gold wash on hover
- Stats + CTA + about/service imagery: scroll-scrubbed parallax layers
- Counters: eased GSAP tween instead of linear rAF
- Locations: staggered card rise, top rule draw-in, lift on hover
- Clients: seamless infinite marquee, colour on hover
- Nav: scroll-linked shrink, rolling link labels
- Buttons: vertical wipe fill + magnetic pull
- Custom gold cursor (dot + trailing ring), disabled on touch and under `prefers-reduced-motion`

Everything respects `prefers-reduced-motion` and turns the cursor off below 900px.
