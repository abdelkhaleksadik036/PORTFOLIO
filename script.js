// ============================================================
// ABDELKHALEK SADIK — PORTFOLIO — script.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Year in footer ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Navbar: solid background on scroll ---- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);

    const backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 480);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---- Theme toggle (dark olive <-> light parchment) ---- */
  const themeToggle = document.getElementById('themeToggle');
  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---- Mobile menu toggle ---- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
    });
    // close menu when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('is-open');
        navLinks.classList.remove('is-open');
      });
    });
  }

  /* ---- Back to top ---- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Scrollspy: active nav link follows the visible section ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length && navLinkEls.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach((link) => {
          const match = link.getAttribute('data-section') === id;
          link.classList.toggle('active', match);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach((s) => spy.observe(s));
  }

  /* ---- Project image "escape" + 3D tilt on hover ---- */
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    const MAX_TILT = 11;      // degrees
    const MAX_SHIFT = 16;     // px, horizontal/vertical drift toward cursor
    const LIFT = 26;          // px, upward "escape" lift
    const SCALE_UP = 1.42;    // how much the image grows

    document.querySelectorAll('.project-thumb').forEach((thumb) => {
      const img = thumb.querySelector('.project-thumb-img');
      if (!img) return; // icon-only thumbs are untouched

      const card = thumb.closest('.project-card');
      let rect = null;

      const onEnter = () => {
        rect = thumb.getBoundingClientRect();
        card.classList.add('is-elevated');
        img.classList.add('is-active');
        img.style.transition = 'transform 0.12s ease-out, box-shadow 0.4s ease, border-radius 0.4s ease';
      };

      const onMove = (e) => {
        if (!rect) rect = thumb.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 2 * MAX_TILT;
        const rotateX = -(py - 0.5) * 2 * MAX_TILT;
        const moveX = (px - 0.5) * 2 * MAX_SHIFT;
        const moveY = (py - 0.5) * 2 * MAX_SHIFT - LIFT;
        img.style.transform =
          `perspective(900px) translate3d(${moveX}px, ${moveY}px, 0) ` +
          `scale(${SCALE_UP}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      };

      const onLeave = () => {
        img.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-radius 0.4s ease';
        img.style.transform = 'none';
        img.classList.remove('is-active');
        card.classList.remove('is-elevated');
        rect = null;
      };

      thumb.addEventListener('mouseenter', onEnter);
      thumb.addEventListener('mousemove', onMove);
      thumb.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // fallback: no IntersectionObserver support
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

});