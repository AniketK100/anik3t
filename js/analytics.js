/**
 * Portfolio Analytics Engine — Powered by PostHog
 * Project: Portfolio (https://anik3t.vercel.app/)
 */
(function () {
  'use strict';

  // Defensive capture wrapper - ensures portfolio never breaks if PostHog fails or is blocked
  function trackEvent(eventName, properties) {
    try {
      if (window.posthog && typeof window.posthog.capture === 'function') {
        var props = properties || {};
        props.site = 'portfolio';
        window.posthog.capture(eventName, props);
      }
    } catch (err) {
      // Fail silently to protect application runtime
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1. REGISTER GLOBAL SUPER PROPERTIES
    try {
      if (window.posthog && typeof window.posthog.register === 'function') {
        window.posthog.register({ site: 'portfolio' });
      }
    } catch (e) {}

    // 2. NAVIGATION TRACKING (Desktop & Mobile)
    document.querySelectorAll('.head__nav a, .menu__nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        var text = link.textContent.trim().replace(/^[0-9]+\s*/, '');
        var href = link.getAttribute('href') || '';
        var navType = link.closest('.head__nav') ? 'desktop' : 'mobile';
        trackEvent('nav_clicked', {
          section_name: text,
          destination: href,
          nav_type: navType
        });
      });
    });

    // 3. RESUME TRACKING
    document.querySelectorAll('a[href*="Resume.pdf"], .btn--head-resume').forEach(function (btn) {
      btn.addEventListener('click', function () {
        trackEvent('resume_clicked', {
          button_name: 'Resume',
          destination: btn.getAttribute('href') || 'Resume.pdf'
        });
      });
    });

    // 4. PROJECT CARD & MODAL OPEN TRACKING
    document.querySelectorAll('.proj-row').forEach(function (row) {
      var projId = row.getAttribute('data-proj-id') || '';
      var projTitleEl = row.querySelector('.proj-row__title');
      var projName = projTitleEl ? projTitleEl.textContent.trim() : projId;

      row.addEventListener('click', function (e) {
        if (e.target.closest('.proj-btn')) return; // Avoid duplicate event when clicking action buttons
        trackEvent('project_clicked', {
          project_id: projId,
          project_name: projName,
          action: 'view_details'
        });
      });
    });

    // 5. PROJECT ACTION BUTTONS (GitHub & Live Demos)
    document.querySelectorAll('.proj-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var row = btn.closest('.proj-row');
        var projTitleEl = row ? row.querySelector('.proj-row__title') : null;
        var projName = projTitleEl ? projTitleEl.textContent.trim() : 'Unknown';
        var href = btn.getAttribute('href') || '';
        var isGithub = btn.classList.contains('proj-btn--github') || href.includes('github.com');
        var linkType = isGithub ? 'github' : 'live_demo';

        trackEvent(isGithub ? 'github_clicked' : 'live_demo_clicked', {
          project_name: projName,
          destination: href,
          link_type: linkType
        });
      });
    });

    // Modal internal action buttons
    var modalActions = document.getElementById('modalActions');
    if (modalActions) {
      modalActions.addEventListener('click', function (e) {
        var btn = e.target.closest('a');
        if (!btn) return;
        var modalTitle = document.getElementById('modalTitle');
        var projName = modalTitle ? modalTitle.textContent.trim() : 'Modal Project';
        var href = btn.getAttribute('href') || '';
        var isGithub = href.includes('github.com');

        trackEvent(isGithub ? 'github_clicked' : 'live_demo_clicked', {
          project_name: projName,
          destination: href,
          location: 'modal'
        });
      });
    }

    // 6. CONTACT & SOCIAL LINK TRACKING
    document.querySelectorAll('.contact__row, .profile-card__email, .menu__foot a').forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href') || '';
        if (href.startsWith('mailto:')) {
          trackEvent('contact_clicked', {
            contact_type: 'email',
            destination: href
          });
        } else if (href.startsWith('tel:')) {
          trackEvent('contact_clicked', {
            contact_type: 'phone',
            destination: href
          });
        } else if (href.includes('github.com')) {
          trackEvent('social_link_clicked', {
            platform: 'github',
            destination: href
          });
        }
      });
    });

    // 7. GITHUB PROFILE LINKS
    document.querySelectorAll('.gh-activity__link, .gh-foot-link').forEach(function (link) {
      link.addEventListener('click', function () {
        trackEvent('github_clicked', {
          platform: 'github_profile',
          destination: link.getAttribute('href') || ''
        });
      });
    });

    // 8. GENERAL OUTBOUND LINK TRACKING
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href') || '';
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          trackEvent('outbound_link_clicked', {
            destination: href,
            text: link.textContent.trim().substring(0, 60)
          });
        }
      });
    });

    // 9. SECTION VIEW ENGAGEMENT (IntersectionObserver)
    if ('IntersectionObserver' in window) {
      var viewedSections = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var sectionId = entry.target.id;
            if (sectionId && !viewedSections[sectionId]) {
              viewedSections[sectionId] = true;
              trackEvent('section_viewed', {
                section_name: sectionId
              });
            }
          }
        });
      }, { threshold: 0.35 });

      document.querySelectorAll('section[id]').forEach(function (sec) {
        observer.observe(sec);
      });
    }

    // 10. SCROLL DEPTH MILESTONES (25%, 50%, 75%, 90%)
    var scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
    window.addEventListener('scroll', function () {
      try {
        var winHeight = window.innerHeight;
        var docHeight = document.documentElement.scrollHeight - winHeight;
        if (docHeight <= 0) return;
        var scrollPercent = Math.round((window.scrollY / docHeight) * 100);

        [25, 50, 75, 90].forEach(function (m) {
          if (scrollPercent >= m && !scrollMilestones[m]) {
            scrollMilestones[m] = true;
            trackEvent('scroll_depth_reached', {
              scroll_depth: m + '%'
            });
          }
        });
      } catch (e) {}
    }, { passive: true });

    // 11. BACK TO TOP CTA TRACKING
    var backToTop = document.querySelector('.footer__top');
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        trackEvent('cta_clicked', {
          button_name: 'Back to Top'
        });
      });
    }
  });

  // 12. SAFE FRONTEND EXCEPTION & REJECTION CAPTURE
  window.addEventListener('error', function (e) {
    try {
      trackEvent('frontend_error', {
        message: e.message || 'Script error',
        filename: e.filename || 'unknown',
        lineno: e.lineno || 0,
        colno: e.colno || 0
      });
    } catch (err) {}
  });

  window.addEventListener('unhandledrejection', function (e) {
    try {
      trackEvent('frontend_error', {
        message: e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled Rejection',
        type: 'unhandled_rejection'
      });
    } catch (err) {}
  });

})();
