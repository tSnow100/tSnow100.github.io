/* PORTAFOLIO - Teo · FROSTFORGE · interacciones (vanilla, sin dependencias) */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobile = window.matchMedia('(max-width: 809px)');
  var reduced = function () { return mqReduce.matches; };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Idioma (inglés por defecto; el HTML está en inglés) ---------- */
  var DICT = window.I18N || { es: {}, ui: { en: {}, es: {} } };
  var EN = {};            // textos originales en inglés, leídos del HTML
  var lang = root.lang === 'es' ? 'es' : 'en';
  var ui = function () { return DICT.ui[lang] || DICT.ui.en; };
  var t = function (key) { return (lang === 'es' ? DICT.es[key] : EN[key]) || EN[key] || key; };

  function captureEnglish() {
    $$('[data-i18n]').forEach(function (el) { var k = el.getAttribute('data-i18n'); if (!(k in EN)) EN[k] = el.textContent; });
    $$('[data-i18n-html]').forEach(function (el) { var k = el.getAttribute('data-i18n-html'); if (!(k in EN)) EN[k] = el.innerHTML; });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var p = pair.split(':'); if (!(p[1] in EN)) EN[p[1]] = el.getAttribute(p[0]) || '';
      });
    });
    ['cMythic'].forEach(function (k) { if (!(k in EN)) EN[k] = 'MythicMobs'; });
  }

  var langListeners = [];
  function applyLang(next) {
    lang = next;
    root.lang = lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    // Solo textos propios del diccionario (sin datos de usuario): seguro usar innerHTML
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) { var p = pair.split(':'); el.setAttribute(p[0], t(p[1])); });
    });
    var desc = $('meta[name="description"]'); if (desc) desc.setAttribute('content', ui().desc);
    langListeners.forEach(function (fn) { fn(); });
  }
  function setupLang() {
    captureEnglish();
    if (lang === 'es') applyLang('es');
    var btn = $('[data-lang-toggle]');
    btn.addEventListener('click', function () {
      var next = lang === 'es' ? 'en' : 'es';
      store.set('lang', next);
      applyLang(next);
    });
  }

  /* ---------- Tema (oscuro por defecto) ---------- */
  function setupTheme() {
    var btn = $('[data-theme-toggle]');
    var meta = $('meta[name="theme-color"]');
    function sync() {
      var dark = root.getAttribute('data-theme') !== 'light';
      btn.setAttribute('aria-pressed', String(dark));
      if (meta) meta.setAttribute('content', dark ? '#0D1620' : '#EEF2F5');
      $$('[data-snow]').forEach(makeSnow); // crea la nieve de las superficies que ahora son visibles
    }
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
      sync();
    });
    sync();
  }

  /* ---------- Hero: entrada del titular ---------- */
  function heroIn() {
    var go = function () { root.classList.add('is-ready'); };
    requestAnimationFrame(function () { requestAnimationFrame(go); });
    setTimeout(go, 120); // respaldo si rAF está en pausa (pestaña en segundo plano)
  }

  /* ---------- Revelado al scroll ---------- */
  function setupReveal() {
    if (reduced() || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.classList.remove('is-pending');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('is-pending');
      io.observe(el);
    });
  }

  /* ---------- Nieve (sprite original, 4 copos de 3 px) sobre las superficies oscuras ----------
     Tema oscuro: una capa fija cubre toda la página. Tema claro: solo las secciones nocturnas.
     Con movimiento reducido los copos quedan quietos, repartidos por la superficie. */
  var snowIO = null;
  function makeSnow(el) {
    if (!el || el.__snow || getComputedStyle(el).display === 'none') return;
    el.__snow = true;
    var still = reduced();
    var count = +el.getAttribute('data-snow') || 30;
    var setFall = function () { el.style.setProperty('--fall', ((el.offsetHeight || 600) + 32) + 'px'); };
    setFall();
    if (!still && 'ResizeObserver' in window) new ResizeObserver(setFall).observe(el);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var f = document.createElement('span');
      var sc = 1.4 + Math.random() * 2.2, size = 3 * sc, dur = 9 + Math.random() * 10;
      f.className = 'flake';
      f.style.left = (Math.random() * 100) + '%';
      f.style.width = size + 'px';
      f.style.height = size + 'px';
      f.style.backgroundSize = (12 * sc) + 'px ' + size + 'px';
      f.style.backgroundPosition = (-Math.floor(Math.random() * 4) * size) + 'px 0';
      f.style.opacity = (0.16 + ((sc - 1.4) / 2.2) * 0.4).toFixed(2);
      if (still) { f.style.top = (Math.random() * 100) + '%'; f.style.animation = 'none'; }
      else {
        f.style.animationDuration = dur + 's';
        f.style.animationDelay = (-Math.random() * dur) + 's';
        f.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      }
      frag.appendChild(f);
    }
    el.appendChild(frag);
    if (snowIO) snowIO.observe(el);
  }

  /* ---------- Nav: progreso, menú móvil ---------- */
  function setInert(sels, on) {
    sels.forEach(function (s) { var el = $(s); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  }
  function setupNav() {
    var prog = $('.nav__progress');
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var btn = $('.nav__menu'), menu = $('#menu');
    function label() { btn.textContent = btn.getAttribute('aria-expanded') === 'true' ? ui().closeMenu : ui().menu; }
    function setMenu(open) {
      btn.setAttribute('aria-expanded', String(open));
      label();
      menu.hidden = !open;
      root.classList.toggle('is-locked', open);
      setInert(['main', '.foot'], open);
      if (open) { var first = $('a', menu); if (first) first.focus(); }
    }
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); }
    });
    mqMobile.addEventListener('change', function (e) { if (!e.matches && !menu.hidden) setMenu(false); });
    langListeners.push(label);
  }

  /* ---------- Lightbox compartido ---------- */
  var SETNAME = {
    en: { m: 'Menus', e: 'Aesthetics', y: 'MythicMobs', z: 'Dungeons', yb: 'MythicMobs: Bosses', yi: 'MythicMobs: Items', zv: 'Dungeons: video' },
    es: { m: 'Menús', e: 'Estética', y: 'MythicMobs', z: 'Mazmorras', yb: 'MythicMobs: Bosses', yi: 'MythicMobs: Items', zv: 'Mazmorras: vídeo' }
  };
  /* Archivo completo de la galería original (imágenes extra y vídeos de YouTube no listados).
     Para añadir un vídeo: yt('ID'), donde el ID va después de youtu.be/ */
  var img = function (f) { return { src: 'assets/images/' + f }; };
  var yt = function (id) { return { yt: id }; };
  var EXTRA = {
    m: ['menu-estetica-02', 'menu-estetica-03', 'menu-estetica-04', 'menu-lore-02', 'menu-lore-03', 'menu-lore-04'].map(function (f) { return img(f + '.webp'); }),
    yb: ['urb6aC2108Q', 'ootBjGNk0Mg', 'a48oCrt0qKA', 'HaOPx2m68c0', 'NlV5oSrl_-8'].map(yt),
    yi: ['GUXYQ3rR2wk', 'bElGPHpUD9o', 'EXlMWy4xv2c', 'j9jKKQMEuqU', 'wWoaho3TbE0', 'X3Wj8w4erss', 'It8mY4_8mMU', 'gG_iKpfUxc4', 'yp3U9OtZH_g', 'Rs3HhBnQNG4'].map(yt),
    zv: [yt('-vlS8ZUXlcU')]
  };
  /* Miniaturas ligeras para el visor (evita descargar la imagen completa para una miniatura de 76 px) */
  var THUMB = { 'portada-forja-7': 'portada-forja-6', 'portada-mazmorras-1600': 'portada-mazmorras-512', 'portada-eventos-10': 'portada-eventos-9', 'menus-01': 'menus-01-512', 'menus-03': 'menus-03-512', 'menus-04': 'menus-04-512', 'mythic-01': 'mythic-01-512', 'estetica-01': 'estetica-01-480', 'estetica-02': 'estetica-02-480', 'estetica-nuevo-01': 'estetica-nuevo-01-480', 'estetica-nuevo-02': 'estetica-nuevo-02-480', 'estetica-nuevo-03': 'estetica-nuevo-03-480', 'estetica-nuevo-04': 'estetica-nuevo-04-480', 'estetica-nuevo-05': 'estetica-nuevo-05-480', 'estetica-nuevo-09': 'estetica-nuevo-09-480', 'estetica-nuevo-11': 'estetica-nuevo-11-480', 'mazmorras-01': 'mazmorras-01-480', 'portada-bosses': 'portada-bosses-480' };
  var lb = { el: null, k: null, i: 0, trigger: null, cache: {}, thumbsFor: null };

  function items(k) {
    if (!lb.cache[k]) {
      lb.cache[k] = $$('[data-lb="' + k + '"]')
        .sort(function (a, b) { return a.getAttribute('data-i') - b.getAttribute('data-i'); })
        .map(function (n) { var im = n.tagName === 'IMG' ? n : $('img', n); return { src: n.getAttribute('data-src'), node: im }; })
        .concat(EXTRA[k] || []);
    }
    return lb.cache[k];
  }
  function altOf(it, i) {
    if (it.node && it.node.alt) return it.node.alt;
    var set = SETNAME[lang][lb.k];
    return it.yt ? ui().video(set, i + 1) : ui().image(set, i + 1);
  }
  function thumbOf(it) {
    if (it.yt) return 'https://i.ytimg.com/vi/' + it.yt + '/mqdefault.jpg';
    var m = /([^/]+)\.webp$/.exec(it.src);
    return m && THUMB[m[1]] ? it.src.replace(m[1] + '.webp', THUMB[m[1]] + '.webp') : it.src;
  }

  function renderLb() {
    var list = items(lb.k), it = list[lb.i];
    var im = $('[data-lb-img]', lb.el), fr = $('[data-lb-yt]', lb.el);
    if (it.yt) {
      im.hidden = true; im.removeAttribute('src');
      var src = 'https://www.youtube-nocookie.com/embed/' + it.yt + '?rel=0&playsinline=1';
      if (fr.getAttribute('src') !== src) fr.src = src;
      fr.hidden = false;
    } else {
      fr.hidden = true; fr.removeAttribute('src');
      im.hidden = false;
      if (im.getAttribute('src') !== it.src) { im.src = it.src; im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; }
      im.alt = altOf(it, lb.i);
    }
    lb.el.classList.toggle('is-single', list.length < 2);
    $('[data-lb-set]', lb.el).textContent = SETNAME[lang][lb.k];
    $('[data-lb-count]', lb.el).textContent = ui().count(lb.i + 1, list.length);
    var th = $('[data-lb-thumbs]', lb.el);
    // Las miniaturas solo se reconstruyen al cambiar de colección o de idioma
    var stamp = lb.k + lang;
    if (lb.thumbsFor !== stamp) {
      lb.thumbsFor = stamp;
      var frag = document.createDocumentFragment();
      list.forEach(function (x, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'lb__thumb';
        b.setAttribute('aria-label', ui().thumb(i + 1, list.length));
        b.setAttribute('data-ti', i);
        var ti = document.createElement('img'); ti.src = thumbOf(x); ti.alt = ''; ti.loading = 'lazy'; ti.decoding = 'async';
        b.appendChild(ti);
        frag.appendChild(b);
      });
      th.textContent = '';
      th.appendChild(frag);
    }
    var cur = null;
    $$('.lb__thumb', th).forEach(function (b, i) {
      if (i === lb.i) { b.setAttribute('aria-current', 'true'); cur = b; } else b.removeAttribute('aria-current');
    });
    if (cur) th.scrollLeft = Math.max(0, cur.offsetLeft - (th.clientWidth - cur.offsetWidth) / 2);
  }

  function openLb(k, i, trigger) {
    lb.k = k; lb.i = i; lb.trigger = trigger || document.activeElement;
    lb.el.hidden = false;
    root.classList.add('is-locked');
    setInert(['.nav', 'main', '.foot', '#menu'], true);
    renderLb();
    $('[data-lb-close]', lb.el).focus();
    setCursor('');
  }
  function closeLb() {
    lb.el.hidden = true;
    var fr = $('[data-lb-yt]', lb.el); fr.removeAttribute('src'); fr.hidden = true;
    root.classList.remove('is-locked');
    setInert(['.nav', 'main', '.foot', '#menu'], false);
    if (!$('#menu').hidden) { root.classList.add('is-locked'); setInert(['main', '.foot'], true); }
    if (lb.trigger && lb.trigger.focus) lb.trigger.focus();
  }
  function stepLb(d) { var n = items(lb.k).length; lb.i = (lb.i + d + n) % n; renderLb(); }

  function setupLightbox() {
    lb.el = $('#lightbox');
    // La imagen del visor se crea aquí: así el HTML no lleva un <img> sin fuente
    var lbImg = document.createElement('img'); lbImg.setAttribute('data-lb-img', ''); lbImg.alt = ''; lbImg.hidden = true;
    $('.lb__img', lb.el).prepend(lbImg);
    document.addEventListener('click', function (e) {
      var tg = e.target.closest('[data-lb]:not(img), [data-open]');
      if (!tg) return;
      if (tg.closest('[data-strip]') && stripDragged) return;
      openLb(tg.getAttribute('data-lb') || tg.getAttribute('data-open'), +tg.getAttribute('data-i') || 0, tg);
    });
    $('[data-lb-close]', lb.el).addEventListener('click', closeLb);
    $('[data-lb-thumbs]', lb.el).addEventListener('click', function (e) {
      var b = e.target.closest('.lb__thumb');
      if (b) { lb.i = +b.getAttribute('data-ti'); renderLb(); }
    });
    $$('[data-lb-step]', lb.el).forEach(function (b) {
      b.addEventListener('click', function () { stepLb(+b.getAttribute('data-lb-step')); });
    });
    lb.el.addEventListener('click', function (e) {
      if (e.target === lb.el || e.target.classList.contains('lb__img') || e.target.classList.contains('lb__stage')) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.el.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight') stepLb(1);
      else if (e.key === 'ArrowLeft') stepLb(-1);
      else if (e.key === 'Tab') {
        var f = $$('button', lb.el).filter(function (b) { return b.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Deslizar en táctil
    var sx = null;
    lb.el.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.el.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 48) stepLb(dx < 0 ? 1 : -1);
    }, { passive: true });
    langListeners.push(function () { if (!lb.el.hidden) renderLb(); });
  }

  /* ---------- Estética: carrusel con arrastre ---------- */
  var stripDragged = false;
  function setupStrip() {
    var el = $('[data-strip]'); if (!el) return;
    var figs = $$('.aes__btn', el);
    var countEl = $('[data-aes-count]');
    var down = false, sx = 0, sl = 0;
    function pl() { return parseFloat(getComputedStyle(el).paddingLeft) || 0; }
    function index() {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) return figs.length - 1;
      var best = 0, bd = 1e9, p = pl();
      figs.forEach(function (f, i) { var d = Math.abs(f.offsetLeft - p - el.scrollLeft); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function go(dir) {
      var i = Math.max(0, Math.min(figs.length - 1, index() + dir));
      el.scrollTo({ left: figs[i].offsetLeft - pl(), behavior: reduced() ? 'auto' : 'smooth' });
    }
    $$('[data-aes]').forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-aes')); }); });
    el.addEventListener('keydown', function (e) {
      if (e.target !== el) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; stripDragged = false; sx = e.clientX; sl = el.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !stripDragged) { stripDragged = true; el.classList.add('is-drag'); }
      if (stripDragged) el.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; el.classList.remove('is-drag');
      setTimeout(function () { stripDragged = false; }, 0);
    });
    el.addEventListener('click', function (e) { if (stripDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    var ticking = false;
    el.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { countEl.textContent = String(index() + 1); ticking = false; });
    }, { passive: true });
  }

  /* ---------- Mazmorras: visor con auto-avance ---------- */
  function setupDungeon() {
    var list = $('[data-mz-list]'); if (!list) return;
    var btns = $$('[data-mz]', list);
    var imgs = $$('.dungeon__frame img');
    var cur = 0, timer = null, hover = false;
    function show(i) {
      cur = i;
      btns.forEach(function (b, j) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', String(j === i)); });
      void list.offsetWidth; // reinicia la barra de progreso
      btns[i].classList.add('is-active');
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', j === i); });
    }
    function start() {
      clearInterval(timer);
      if (reduced()) { list.classList.add('is-static'); return; }
      timer = setInterval(function () { if (!hover && lb.el.hidden) show((cur + 1) % btns.length); }, 6000);
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { show(i); start(); }); });
    list.addEventListener('mouseenter', function () { hover = true; list.classList.add('is-paused'); });
    list.addEventListener('mouseleave', function () { hover = false; list.classList.remove('is-paused'); show(cur); start(); });
    $('[data-mz-open]').addEventListener('click', function (e) { openLb('z', cur, e.currentTarget); });
    // Solo avanza cuando la sección está a la vista
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { show(cur); start(); } else clearInterval(timer);
      }).observe(list.closest('section'));
    } else start();
  }

  /* ---------- Especialidades: vista previa + acordeón ---------- */
  function setupSpecs() {
    var rows = $$('[data-spec]');
    var imgs = $$('.spec__frame img');
    var cap = $('[data-spec-cap]');
    var active = 0;
    function act(i) {
      active = i;
      rows.forEach(function (r, j) { r.classList.toggle('is-active', j === i); });
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', j === i); });
      cap.textContent = t(rows[i].getAttribute('data-name-key'));
    }
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { act(i); });
      r.addEventListener('focus', function () { act(i); });
    });
    langListeners.push(function () { act(active); });
    act(0);

    $$('.acc__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        b.closest('.acc__item').classList.toggle('is-open', open);
      });
    });
  }

  /* ---------- Nav: sección activa ---------- */
  function setupActive() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__links a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var groups = { trabajos: 'trabajos', menus: 'trabajos', estetica: 'trabajos', mythicmobs: 'trabajos', mazmorras: 'trabajos', especialidades: 'especialidades', herramientas: 'herramientas', 'sobre-mi': 'sobre-mi' };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = groups[en.target.id];
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (key && map[key]) map[key].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'trabajos', 'estetica', 'mythicmobs', 'mazmorras', 'especialidades', 'herramientas', 'sobre-mi', 'contacto'].forEach(function (id) {
      var s = document.getElementById(id); if (s) io.observe(s);
    });
  }

  /* ---------- Copiar usuario de Discord ---------- */
  function setupCopy() {
    var btn = $('[data-copy]'); if (!btn) return;
    var label = $('[data-copy-label]', btn), live = $('[data-copy-live]'), timer;
    function fallback(text) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); return ok;
    }
    function done(ok) {
      label.textContent = ok ? ui().copied : ui().copyFail;
      live.textContent = ok ? ui().liveCopied : ui().liveFail;
      btn.classList.toggle('is-done', ok);
      clearTimeout(timer);
      timer = setTimeout(function () { label.textContent = t('copy'); btn.classList.remove('is-done'); live.textContent = ''; }, 1800);
    }
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else done(fallback(text));
    });
  }

  /* ---------- Cursor contextual (solo puntero fino) ---------- */
  var setCursor = function () {};
  function setupCursor() {
    if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var c = document.createElement('div'); c.className = 'cursor'; c.setAttribute('aria-hidden', 'true');
    var b = document.createElement('div'); b.className = 'cursor__b';
    c.appendChild(b); document.body.appendChild(c);
    var x = -200, y = -200, tx = -200, ty = -200, raf = null;
    setCursor = function (key) { if (key) b.textContent = ui()[key] || key; c.classList.toggle('is-on', !!key && lb.el.hidden); };
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      var tg = e.target.closest && e.target.closest('[data-cursor]');
      setCursor(tg ? tg.getAttribute('data-cursor') : '');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { setCursor(''); });
    function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      c.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      raf = (Math.abs(tx - x) > .1 || Math.abs(ty - y) > .1) ? requestAnimationFrame(loop) : null;
    }
  }

  /* ---------- Pausa de animaciones continuas fuera de pantalla ---------- */
  function pauseOffscreen() {
    if (!('IntersectionObserver' in window)) return;
    snowIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-off', !en.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    $$('.mq__row').forEach(function (el) { snowIO.observe(el); });
  }

  /* ---------- Init ---------- */
  function init() {
    if (!reduced()) heroIn(); else root.classList.add('is-ready');
    pauseOffscreen();
    setupLang();
    setupNav();
    setupLightbox();
    setupStrip();
    setupDungeon();
    setupSpecs();
    setupActive();
    setupCopy();
    setupCursor();
    setupReveal();
    setupTheme(); // crea también la nieve de las superficies visibles
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
