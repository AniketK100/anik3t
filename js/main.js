/* ============================================================
   ANIKET KAKAD — PORTFOLIO 2026 · interactions
   Lenis + GSAP (ScrollTrigger) · no framework
   ============================================================ */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(pointer: fine)').matches;

  function splitChars(el) {
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(el.childNodes, function (node) {
      if (node.nodeType === 3) {
        var text = node.textContent;
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
          } else {
            var span = document.createElement('span');
            span.className = 'ch';
            span.setAttribute('aria-hidden', 'true');
            var inner = document.createElement('i');
            inner.textContent = ch;
            span.appendChild(inner);
            frag.appendChild(span);
          }
        }
      } else if (node.nodeType === 1) {
        var elSpan = document.createElement('span');
        elSpan.className = 'ch';
        var elInner = document.createElement('i');
        if (node.className && typeof node.className === 'string') {
          elInner.className = node.className;
        }
        elInner.textContent = node.textContent;
        elSpan.appendChild(elInner);
        frag.appendChild(elSpan);
      }
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  function splitWords(el) {
    var words = el.textContent.split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, idx) {
      if (idx > 0) el.appendChild(document.createTextNode(' '));
      var span = document.createElement('span');
      span.className = 'w';
      var inner = document.createElement('i');
      inner.textContent = word;
      span.appendChild(inner);
      el.appendChild(span);
    });
  }

  var preloader = document.getElementById('preloader');
  var lenis = null;

  function boot() {
    document.querySelectorAll('[data-hero-line]').forEach(splitChars);
    document.querySelectorAll('[data-lines]').forEach(splitWords);

    if (RM) {
      if (preloader) preloader.style.display = 'none';
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    if (typeof window.gsap === 'undefined') {
      if (preloader) preloader.style.display = 'none';
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
      });
      lenis.stop();
      if (ScrollTrigger) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      }
    }

    /* ---- preloader + entrance ---- */
    var tl = gsap.timeline({
      onComplete: function () {
        if (preloader) preloader.classList.add('is-done');
        if (lenis) lenis.start();
        gsap.to('.preloader', { pointerEvents: 'none', duration: 0.1, delay: 0.9 });
        entrance();
      }
    });
    var preSkill = document.getElementById('preSkill');
    var preCount = document.getElementById('preCount');
    var preSkills = [
      'LOADING // FULL-STACK ENGINE',
      'LOADING // REAL-TIME SYSTEMS',
      'LOADING // AI INTEGRATION',
      'LOADING // SECURITY HARDENING',
      'LOADING // READY'
    ];
    if (preSkill) {
      var si = 0;
      setInterval(function () {
        si = (si + 1) % preSkills.length;
        preSkill.textContent = preSkills[si];
      }, 430);
    }
    var prog = { v: 0 };
    if (preCount) {
      gsap.to(prog, {
        v: 100, duration: 1.1, ease: 'power2.inOut',
        onUpdate: function () {
          preCount.textContent = String(Math.round(prog.v)).padStart(3, '0');
        }
      });
    }
    gsap.set('.pre__name, .pre__skill, .pre__count', { opacity: 1, y: 0 });
    tl.fromTo('#preLine', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
      .to('.pre__name', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .to('.pre__status > *', { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0);

    function entrance() {
      gsap.fromTo('.hero__line .ch i',
        { yPercent: 118, rotate: 0 },
        { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.045, delay: 0.1 }
      );
      gsap.fromTo('[data-hero-fade]',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.55 }
      );
    }

    /* ---- smooth anchor scrolling ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    /* ---- scroll choreography ---- */
    if (ScrollTrigger) {
      gsap.to('#progressBar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
      });

      gsap.to('.hero__title-wrap', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero__bottom', {
        yPercent: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '30% top', scrub: true }
      });

      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        gsap.fromTo(el,
          { y: 46, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
          }
        );
      });

      document.querySelectorAll('[data-lines]').forEach(function (el) {
        var words = el.querySelectorAll('.w i');
        gsap.fromTo(words,
          { yPercent: 120 },
          {
            yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.022,
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        );
      });

      document.querySelectorAll('.contact__title [data-hero-line]').forEach(function (line) {
        gsap.fromTo(line.querySelectorAll('.ch i'),
          { yPercent: 118 },
          {
            yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: 0.03,
            scrollTrigger: { trigger: '.contact__title', start: 'top 82%' }
          }
        );
      });

      document.querySelectorAll('.sec__idx').forEach(function (idx) {
        gsap.fromTo(idx,
          { y: 18, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: idx, start: 'top 92%' }
          }
        );
      });
    }


    /* ---- magnetic ---- */
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * 0.18, y: y * 0.18, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---- cursor ---- */
  function cursor() {
    if (!FINE || RM) return;
    var cur = document.getElementById('cursor');
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function loop() {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      cur.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%, -50%)';
      requestAnimationFrame(loop);
    })();


    window.addEventListener('pointerdown', function () {
      if (window.gsap) window.gsap.to(cur, { scale: 0.7, duration: 0.2 });
    });
    window.addEventListener('pointerup', function () {
      if (window.gsap) window.gsap.to(cur, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    });
  }

  /* ---- clock (IST) ---- */
  function clock() {
    var el = document.getElementById('clock');
    if (!el) return;
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    function tick() { el.textContent = fmt.format(new Date()); }
    tick();
    setInterval(tick, 1000);
  }

  /* ---- menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (burger) burger.setAttribute('aria-label', 'Open menu');
    if (menu) menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---- project modal handler ---- */
  function initModal() {
    var modal = document.getElementById('projModal');
    var modalOverlay = document.getElementById('projModalOverlay');
    var modalClose = document.getElementById('projModalClose');
    var modalImg = document.getElementById('modalImg');
    var modalBadge = document.getElementById('modalBadge');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc = document.getElementById('modalDesc');
    var modalPills = document.getElementById('modalPills');
    var modalActions = document.getElementById('modalActions');

    if (!modal) return;

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      if (lenis) lenis.start();
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    document.querySelectorAll('.proj-row').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;

        var img = card.querySelector('.proj-row__prev img');
        var badge = card.querySelector('.proj-row__badge');
        var title = card.querySelector('.proj-row__title');
        var desc = card.querySelector('.proj-row__desc');
        var pills = card.querySelector('.proj-row__pills');
        var actions = card.querySelector('.proj-row__actions');

        if (modalImg && img) modalImg.src = img.src;
        if (modalBadge) {
          modalBadge.textContent = badge ? badge.textContent : '';
          modalBadge.style.display = badge ? 'inline-block' : 'none';
        }
        if (modalTitle && title) modalTitle.textContent = title.textContent;
        if (modalDesc) modalDesc.textContent = card.getAttribute('data-modal-desc') || (desc ? desc.textContent : '');
        if (modalPills && pills) modalPills.innerHTML = pills.innerHTML;
        if (modalActions && actions) modalActions.innerHTML = actions.innerHTML;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        if (lenis) lenis.stop();
      });
    });
  }

  /* ---- live github activity fetcher ---- */
  function fetchGitHubActivity() {
    var countEl = document.getElementById('ghCount');
    var chartImg = document.getElementById('ghChartImg');

    if (chartImg) {
      chartImg.src = 'https://ghchart.rshah.org/39d353/AniketK100?t=' + Date.now();
    }

    if (countEl) {
      fetch('https://api.github.com/users/AniketK100')
        .then(function (res) { return res.json(); })
        .then(function (user) {
          fetch('https://api.github.com/users/AniketK100/events')
            .then(function (r) { return r.json(); })
            .then(function (events) {
              if (Array.isArray(events) && events.length > 0) {
                var last = events[0];
                var repo = (last.repo && last.repo.name) ? last.repo.name : 'AniketK100/Aniket';
                var dt = last.created_at ? new Date(last.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'recently';
                countEl.textContent = 'Live Activity: ' + (user.public_repos || 4) + ' public repos • Latest push to ' + repo + ' (' + dt + ')';
              } else {
                countEl.textContent = 'Live GitHub Profile Active — @AniketK100';
              }
            })
            .catch(function () {
              countEl.textContent = 'Live GitHub Profile Active — @AniketK100';
            });
        })
        .catch(function () {
          countEl.textContent = 'Live GitHub Profile Active — @AniketK100';
        });
    }
  }

  /* ---- boot ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { boot(); initModal(); fetchGitHubActivity(); });
  } else {
    boot();
    initModal();
    fetchGitHubActivity();
  }
  /* cursor(); -- disabled, using standard native browser cursor */
  clock();

  /* ---- content protection: no drag, no right-click ---- */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
})();
