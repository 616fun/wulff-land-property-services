/* Wulff Land & Property Services — site behaviour. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- year ---------- */
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- sticky header ---------- */
  var header = $('#header');
  var onScroll = function () {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile drawer ---------- */
  var burger = $('#burger'), drawer = $('#drawer');
  if (burger && drawer) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = $$('.r');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('in'); }, Math.min(i * 70, 280));
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- gallery filter ---------- */
  var filters = $$('.filters button');
  var empty = $('#empty');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        $$('.shot').forEach(function (s) {
          var match = f === 'all' || s.dataset.cat === f;
          s.hidden = !match;
          if (match) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ---------- lightbox ---------- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
  var idx = -1, lastFocus = null;
  var visible = function () { return $$('.shot').filter(function (s) { return !s.hidden; }); };

  var show = function (i) {
    var list = visible();
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    var fig = list[idx];
    lbImg.src = fig.dataset.full;
    lbImg.alt = ($('img', fig) || {}).alt || '';
    if (lbCount) lbCount.textContent = (idx + 1) + ' / ' + list.length;
  };
  var open = function (i, from) {
    if (!lb) return;
    lastFocus = from || document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    show(i);
    $('#lbClose').focus();
  };
  var close = function () {
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 280);
    if (lastFocus) lastFocus.focus();
  };

  if (lb) {
    $$('.shot').forEach(function (fig) {
      var go = function () { open(visible().indexOf(fig), fig); };
      fig.addEventListener('click', go);
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
    $('#lbNext').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    // swipe
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 55) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* ---------- quote form ----------
     Works with no backend: falls back to a pre-filled email.
     To collect submissions properly, put a Formspree (or similar) URL in
     the form's data-endpoint attribute in contact.html.                */
  var form = $('#quoteForm'), note = $('#formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return; // honeypot
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k[0] !== '_') data[k] = v; });
      var btn = form.querySelector('button[type="submit"]');
      var endpoint = form.dataset.endpoint;

      var body =
        'Name: ' + (data.name || '') + '\n' +
        'Phone: ' + (data.phone || '') + '\n' +
        'Email: ' + (data.email || '') + '\n' +
        'City: ' + (data.city || '') + '\n' +
        'Service: ' + (data.service || '') + '\n\n' +
        (data.message || '');

      if (!endpoint) {
        window.location.href = 'mailto:Wulfflandservices@gmail.com'
          + '?subject=' + encodeURIComponent('Quote request — ' + (data.name || 'Website'))
          + '&body=' + encodeURIComponent(body);
        if (note) note.textContent = 'Opening your email application with the details filled in…';
        return;
      }

      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(endpoint, {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        form.innerHTML = '<div style="text-align:center;padding:40px 0">'
          + '<h3 style="margin-bottom:12px">Request received.</h3>'
          + '<p class="muted">Thank you — we\'ll be in touch shortly, typically the same day. '
          + 'For anything urgent, call <a href="tel:+17653935386" style="color:var(--steel-lt)">(765) 393-5386</a>.</p></div>';
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Send my request';
        if (note) note.innerHTML = 'The request could not be sent. Please call or text '
          + '<a href="tel:+17653935386" style="color:var(--steel-lt)">(765) 393-5386</a>.';
      });
    });
  }
})();
