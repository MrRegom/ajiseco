/**
 * ==============================================================================
 * EL AJÍ SECO DEL MAR — MOTOR DE MOVIMIENTO Y CINEMÁTICA
 * Lenis Smooth Scroll + GSAP ScrollTrigger + Words Reveal + Menu
 * ==============================================================================
 */

(function () {
  'use strict';

  function initMotion() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP o ScrollTrigger no cargados aún');
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Lenis Smooth Scroll
    if (!reduceMotion && window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.lenis = lenis;
    }

    // 2. Entradas progresivas por scroll (IntersectionObserver)
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          reveal.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

    // 3. ScrollWorld: El Paseo Cinemático por El Ají Seco
    const world = document.querySelector('[data-world]');
    if (world && window.initWorld) {
      window.initWorld(world, reduceMotion);
    }

    // 4. Frase / Tagline: iluminación palabra por palabra con el scroll
    document.querySelectorAll('[data-words]').forEach((block) => {
      const words = Array.from(block.querySelectorAll('[data-word]'));
      if (reduceMotion) {
        words.forEach((word) => word.classList.add('is-lit'));
        return;
      }
      ScrollTrigger.create({
        trigger: block,
        start: 'top 80%',
        end: 'bottom 45%',
        onUpdate: (self) => {
          const lit = Math.round(self.progress * words.length);
          words.forEach((word, i) => word.classList.toggle('is-lit', i < lit));
        },
      });
    });

    // 5. Menú Móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('menu');
    if (menuToggle && menu) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        menu.classList.toggle('invisible', isExpanded);
        menu.classList.toggle('opacity-0', isExpanded);
        menu.classList.toggle('pointer-events-none', isExpanded);
        if (isExpanded) {
          menu.setAttribute('inert', '');
        } else {
          menu.removeAttribute('inert');
        }
      });

      menu.querySelectorAll('[data-menu-link]').forEach((link) => {
        link.addEventListener('click', () => {
          menuToggle.setAttribute('aria-expanded', 'false');
          menu.classList.add('invisible', 'opacity-0', 'pointer-events-none');
          menu.setAttribute('inert', '');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
