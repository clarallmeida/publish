/* Clara Almeida — portfolio. Two small behaviours, no dependencies. */

(function () {
  'use strict';

  /* ---- Mobile navigation -------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- Reveal on scroll ---------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var fired = false;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fired = true;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });

    /* Failsafe. These elements start at opacity 0, so if the observer never
       reports (a zero-size viewport, an embedded or offscreen context, some
       restored-scroll cases) the content stays invisible for good. Content
       being seen matters more than the animation: if nothing has revealed
       shortly after load, show everything. */
    var failsafe = function () {
      setTimeout(function () {
        if (fired) return;
        Array.prototype.forEach.call(reveals, function (el) {
          el.classList.add('is-in');
        });
      }, 1200);
    };

    if (document.readyState === 'complete') failsafe();
    else window.addEventListener('load', failsafe);
  }

  /* ---- Demo loops ------------------------------------------------------
     Autoplaying video is motion. If the visitor asked for less of it,
     pause the loops and show controls instead. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(
      document.querySelectorAll('video[autoplay]'),
      function (v) {
        v.autoplay = false;
        v.removeAttribute('autoplay');
        v.controls = true;
        v.pause();
      }
    );
  }

  /* Play only the demo that is actually on screen. Several looping videos
     decoding at once is wasteful, and offscreen video still costs battery.
     Videos stripped of autoplay just above (reduced motion) are skipped,
     because they no longer match the selector. */
  var demos = document.querySelectorAll('video[autoplay]');

  if (demos.length && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var playing = v.play();
          /* Autoplay can still be refused; a rejected promise is not an error. */
          if (playing && playing.catch) playing.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.2 });

    Array.prototype.forEach.call(demos, function (v) { vio.observe(v); });
  }

  /* ---- Sound on demos that carry it ------------------------------------
     Browsers only autoplay muted video, so these start silent. Build the
     control in JS: without JS there is no way to unmute anyway, and a dead
     button would be worse than none. */
  Array.prototype.forEach.call(
    document.querySelectorAll('video[data-sound]'),
    function (v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sound-toggle';

      var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('width', '13');
      icon.setAttribute('height', '13');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'currentColor');
      icon.setAttribute('aria-hidden', 'true');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M4 9v6h4l5 4V5L8 9H4z');
      icon.appendChild(path);

      var label = document.createElement('span');
      btn.appendChild(icon);
      btn.appendChild(label);

      function sync() {
        var on = !v.muted;
        label.textContent = on ? 'Sound on' : 'Sound off';
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      }

      btn.addEventListener('click', function () {
        v.muted = !v.muted;
        if (!v.muted) {
          var playing = v.play();
          if (playing && playing.catch) playing.catch(function () {});
        }
        sync();
      });

      sync();
      v.parentNode.appendChild(btn);
    }
  );

  /* ---- Work index filters (work.html only) ---------------------------- */
  var filters = document.querySelectorAll('.filter');
  var rows = document.querySelectorAll('.index__row');

  if (filters.length && rows.length) {
    Array.prototype.forEach.call(filters, function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.dataset.filter;

        Array.prototype.forEach.call(filters, function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });

        Array.prototype.forEach.call(rows, function (row) {
          var cats = (row.dataset.category || '').split(' ');
          row.hidden = !(want === 'all' || cats.indexOf(want) !== -1);
        });
      });
    });
  }

  /* ---- Contact link -------------------------------------------------
     The bundled single-file build puts every page in one document, so
     several elements end up carrying id="contact" and the browser jumps
     to the first — which sits inside a hidden route, so nothing moves.
     Scroll to the footer belonging to the page actually on screen. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href="#contact"]');
    if (!link) return;
    /* The nav lives in shared chrome outside the route divs, so scope to the
       route currently on screen rather than to the link's ancestors. */
    var scope = document.querySelector('.route:not([hidden])') || document;
    var footer = scope.querySelector('.site-footer');
    if (!footer) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    footer.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  });
})();
