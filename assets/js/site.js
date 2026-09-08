/* Wulff Land & Property Services — site behaviour. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* The drawer and the lightbox can both be open at once. Track who wants the
     page held still so closing one doesn't unlock scrolling for the other. */
  var scrollLocks = {};
  var setScrollLock = function (owner, on) {
    if (on) scrollLocks[owner] = 1; else delete scrollLocks[owner];
    document.body.style.overflow = Object.keys(scrollLocks).length ? 'hidden' : '';
  };

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
      setScrollLock('drawer', open);
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
  var idx = -1, lastFocus = null, closeTimer = null;
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
    // a close is animating out — cancel its teardown or it will blank this one
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    lastFocus = from || document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    setScrollLock('lightbox', true);
    show(i);
    $('#lbClose').focus();
  };
  var close = function () {
    if (!lb) return;
    lb.classList.remove('is-open');
    setScrollLock('lightbox', false);
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      closeTimer = null;
      lb.hidden = true;
      lbImg.removeAttribute('src');
    }, 280);
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

  /* ---------- estimate form ----------
     With a backend (put a Formspree-style URL in the form's data-endpoint
     attribute) the request is posted and confirmed in place.

     Without one there is nothing to post to, so we must not pretend the
     request was sent. A bare `location.href = "mailto:"` fails silently on
     any device with no mail handler configured — the visitor sees nothing
     happen and the lead is lost without anyone knowing. Instead we hand
     back the finished message and three ways to send it. */
  var form = $('#quoteForm'), note = $('#formNote');

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var panel = function (html) {
    form.innerHTML = '<div class="sent">' + html + '</div>';
    form.querySelector('.sent').scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

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
      var subject = 'Estimate request — ' + (data.name || 'Website');

      /* ---- no backend: give the visitor a way that actually works ---- */
      if (!endpoint) {
        var mail = 'mailto:Wulfflandservices@gmail.com?subject=' + encodeURIComponent(subject)
                 + '&body=' + encodeURIComponent(body);
        var sms  = 'sms:+17653935386?&body=' + encodeURIComponent(body);
        var touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

        // whichever channel fits the device leads; the other is secondary
        var mk = function (href, label, primary) {
          return '<a class="btn ' + (primary ? '' : 'btn--ghost ') + 'btn--block" href="' + href + '">' + label + '</a>';
        };
        var textBtn = mk(sms, 'Send as a text message', touch);
        var mailBtn = mk(mail, 'Send as an email', !touch);

        panel(
          '<h3>One more step</h3>' +
          '<p class="muted">Your request is written out below but has not been sent yet. ' +
          'Choose how you would like it to reach us — or just call.</p>' +
          '<div class="sent__actions">' +
            (touch ? textBtn + mailBtn : mailBtn + textBtn) +
            '<a class="btn btn--ghost btn--block" href="tel:+17653935386">Call (765) 393-5386</a>' +
          '</div>' +
          '<label class="sent__label" for="sentBody">Your request</label>' +
          '<textarea id="sentBody" class="sent__body" readonly rows="8">' + esc(body) + '</textarea>' +
          '<button type="button" class="btn btn--ghost btn--block" id="copyBtn">Copy these details</button>'
        );

        var copy = $('#copyBtn');
        copy.addEventListener('click', function () {
          var ta = $('#sentBody');
          ta.select(); ta.setSelectionRange(0, 99999);
          var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy these details'; }, 2000); };
          if (navigator.clipboard) { navigator.clipboard.writeText(ta.value).then(done, done); }
          else { try { document.execCommand('copy'); done(); } catch (err) { copy.textContent = 'Press Ctrl/Cmd + C'; } }
        });
        return;
      }

      /* ---- backend configured ---- */
      // Formspree reads these: _subject titles the notification email, and the
      // field named "email" becomes the reply-to, so hitting Reply in the inbox
      // answers the customer directly.
      var subj = form.querySelector('[name="_subject"]');
      if (subj) subj.value = subject + (data.city ? ' (' + data.city + ')' : '');

      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(endpoint, {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        panel('<h3>Request received.</h3>'
          + '<p class="muted">Thank you — we\'ll be in touch shortly, typically the same day. '
          + 'For anything urgent, call <a href="tel:+17653935386">(765) 393-5386</a>.</p>');
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Submit request';
        if (note) note.innerHTML = 'The request could not be sent. Please call or text '
          + '<a href="tel:+17653935386">(765) 393-5386</a>.';
      });
    });
  }
})();
