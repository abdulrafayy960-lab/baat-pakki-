(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Split names into letters for the text-reveal */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var t = el.textContent; el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    t.split('').forEach(function (c, i) {
      var s = document.createElement('span');
      s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i);
      el.appendChild(s);
    });
  });

  /* Scroll reveal for the story, deen and dua sections */
  document.documentElement.classList.add('js');
  var rv = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }

  if (reduce) return;

  /* 2. Floating golden particles (canvas, capped for performance) */
  var cv = document.getElementById('dust'), ctx = cv.getContext('2d');
  var w, h, dpr, sc = 1, parts = [], raf, running = true;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight; sc = Math.max(1, w / 1440);
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(sc > 1.4 ? 120 : 70, Math.round(w * h / 18000));
    parts = [];
    for (var i = 0; i < n; i++) parts.push(make(true));
  }
  function make(anywhere) {
    return {
      x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10,
      r: (Math.random() * 1.8 + .4) * sc, v: Math.random() * .35 + .1,
      s: Math.random() * Math.PI * 2, a: Math.random() * .6 + .25
    };
  }
  function tick(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.v; p.x += Math.sin(t / 1800 + p.s) * .25;
      if (p.y < -10) parts[i] = make(false);
      var tw = .6 + .4 * Math.sin(t / 700 + p.s);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      g.addColorStop(0, 'rgba(246,231,193,' + (p.a * tw) + ')');
      g.addColorStop(1, 'rgba(217,184,114,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }
  size();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  raf = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) raf = requestAnimationFrame(tick);
  });

  /* 3. Subtle animated hearts */
  var box = document.getElementById('hearts');
  function heart() {
    if (document.hidden) return;
    var e = document.createElement('span');
    e.className = 'fh'; e.textContent = '❤';
    e.style.left = Math.random() * 100 + '%';
    e.style.fontSize = ((8 + Math.random() * 12) * Math.max(1, window.innerWidth / 1440)) + 'px';
    e.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    var d = 9 + Math.random() * 7;
    e.style.animationDuration = d + 's';
    box.appendChild(e);
    setTimeout(function () { e.remove(); }, d * 1000);
  }
  setTimeout(function () { setInterval(heart, 1700); heart(); }, 3500);

  /* 4. Gentle parallax (pointer, throttled via rAF) */
  var hero = document.getElementById('hero');
  var layers = [
    { el: document.querySelector('.content'), k: 10 },
    { el: document.querySelector('.l1'), k: -26 },
    { el: document.querySelector('.l2'), k: 22 },
    { el: document.querySelector('.frame'), k: -4 }
  ];
  var tx = 0, ty = 0, cx = 0, cy = 0, pending = false;
  function apply() {
    pending = false; cx += (tx - cx) * .12; cy += (ty - cy) * .12;
    layers.forEach(function (l) {
      if (l.el) l.el.style.transform = 'translate3d(' + (cx * l.k).toFixed(2) + 'px,' + (cy * l.k).toFixed(2) + 'px,0)';
    });
    if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) { pending = true; requestAnimationFrame(apply); }
  }
  hero.addEventListener('pointermove', function (e) {
    tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5;
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }, { passive: true });
})();
