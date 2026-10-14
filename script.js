// Portfolio interactions and motion, with reduced-motion support.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.getElementById('introScreen');
  const siteContent = document.getElementById('siteContent');
  const introStart = document.getElementById('introStart');
  if (intro && siteContent && introStart) {
    document.body.classList.add('intro-active');
    introStart.addEventListener('click', () => {
      intro.classList.add('is-leaving');
      siteContent.inert = false;
      siteContent.removeAttribute('aria-hidden');
      siteContent.classList.remove('is-locked');
      siteContent.classList.add('is-entering');
      document.body.classList.remove('intro-active');
      window.setTimeout(() => {
        intro.hidden = true;
        siteContent.classList.remove('is-entering');
        document.getElementById('home')?.focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 760);
      window.setTimeout(() => document.querySelector('.hero-title')?.classList.add('intro-reveal'), 120);
    });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Restore the chosen color theme without blocking the page if storage is disabled.
  const themeToggle = document.getElementById('themeToggle');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (_) { /* private browsing */ }
  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  };
  if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (_) { /* theme still works */ }
  });

  // Give the hero headline a small rotating signature word.
  const heroWord = document.querySelector('.hero-title .accent-text');
  if (heroWord && !reducedMotion.matches) {
    const words = ['systèmes', 'projets', 'solutions', 'expériences'];
    let wordIndex = 0;
    heroWord.setAttribute('aria-live', 'polite');
    window.setInterval(() => {
      if (document.hidden) return;
      wordIndex = (wordIndex + 1) % words.length;
      heroWord.classList.remove('word-swap');
      void heroWord.offsetWidth;
      heroWord.textContent = words[wordIndex];
      heroWord.classList.add('word-swap');
    }, 2600);
  }

  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  // Lightweight ambient constellation gives the page a little depth without a library.
  if (!reducedMotion.matches) {
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let width = 0, height = 0, frame = 0;
      let points = [];
      const pointer = { x: -1000, y: -1000 };
      const resizeCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth; height = window.innerHeight;
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const mobile = window.matchMedia('(max-width: 680px)').matches;
        const count = mobile
          ? Math.min(34, Math.max(18, Math.floor(width * height / 30000)))
          : Math.min(76, Math.max(28, Math.floor(width * height / 19000)));
        points = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: Math.random() * 1.5 + .5 }));
      };
      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        const color = getComputedStyle(root).getPropertyValue('--accent').trim() || '#4fd1c5';
        points.forEach((p, i) => {
          const dx = pointer.x - p.x, dy = pointer.y - p.y, dist = Math.hypot(dx, dy);
          if (dist < 125 && dist > 0) { p.x -= dx / dist * .18; p.y -= dy / dist * .18; }
          p.x += p.vx; p.y += p.vy;
          if (p.x < -5 || p.x > width + 5) p.vx *= -1;
          if (p.y < -5 || p.y > height + 5) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.globalAlpha = .45; ctx.fill();
          for (let j = i + 1; j < points.length; j++) {
            const q = points[j], distance = Math.hypot(p.x - q.x, p.y - q.y);
            if (distance < 105) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = color; ctx.globalAlpha = (1 - distance / 105) * .14; ctx.lineWidth = 1; ctx.stroke();
            }
          }
        });
        ctx.globalAlpha = 1;
        frame = requestAnimationFrame(draw);
      };
      resizeCanvas(); draw();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
        else if (!frame) draw();
      });
    }
  }
  let scrollQueued = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    navbar?.classList.toggle('is-scrolled', window.scrollY > 12);
    backToTop?.classList.toggle('is-visible', window.scrollY > 480);
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  // Mobile navigation supports Escape, outside clicks and keyboard state.
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const setMenu = (open) => {
    menuToggle?.classList.toggle('is-open', open);
    navLinks?.classList.toggle('is-open', open);
    document.body.classList.toggle('mobile-nav-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
  };
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.addEventListener('click', () => setMenu(!navLinks?.classList.contains('is-open')));
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });
  document.addEventListener('click', event => {
    if (navLinks?.classList.contains('is-open') && !navLinks.contains(event.target) && !menuToggle?.contains(event.target)) setMenu(false);
  });

  // Keep native anchor behavior (shareable URLs, keyboard support, back button).
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', link.hash);
    });
  });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));

  // Section-aware navigation with a stable fallback for older browsers.
  const sections = [...document.querySelectorAll('section[id]')];
  const navItems = [...document.querySelectorAll('.nav-link')];
  const activate = id => navItems.forEach(link => link.classList.toggle('active', link.dataset.section === id));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) activate(visible.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
    sections.forEach(section => spy.observe(section));
  }

  // Reveal content and stagger cards as they enter the viewport.
  const revealTargets = document.querySelectorAll('.reveal, .info-cards, .skills-grid, .projects-grid, .contact-grid');
  document.querySelectorAll('.info-cards, .skills-grid, .projects-grid, .contact-grid').forEach(el => el.classList.add('reveal-stagger'));
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .12, rootMargin: '0px 0px -36px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else revealTargets.forEach(el => el.classList.add('is-visible'));

  // Subtle pointer tilt on project cards. Touch devices and reduced motion stay still.
  if (!reducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty('--magnet-x', `${(event.clientX - rect.left - rect.width / 2) * .08}px`);
        button.style.setProperty('--magnet-y', `${(event.clientY - rect.top - rect.height / 2) * .1}px`);
      }, { passive: true });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnet-x', '0px');
        button.style.setProperty('--magnet-y', '0px');
      });
    });
    document.querySelectorAll('.project-card, .contact-card, .skill-cat, .info-card, .t-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
    document.querySelectorAll('.project-card').forEach(card => {
      let frame = 0;
      card.addEventListener('pointermove', event => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.setProperty('--tilt-x', `${-y * 3}deg`);
          card.style.setProperty('--tilt-y', `${x * 3}deg`);
          frame = 0;
        });
      });
      card.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
});
