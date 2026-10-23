/**
 * EL AJÍ SECO DEL MAR — SCRIPT PRINCIPAL DE INTERACCIÓN Y ACCESIBILIDAD
 * Libre de frameworks pesados, 100% vanilla JS y buenas prácticas OWASP/WCAG.
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const progressBar = document.getElementById('scroll-progress');
  const burger = document.getElementById('burger-btn');
  const nav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('.nav__link');

  // 1. Barra de progreso de lectura y Header Sticky
  function updateScrollState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (header) {
      if (scrollTop > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // 2. Menú Móvil Accesible (ARIA)
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isExpanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('is-open');
    });

    // Cerrar menú al hacer click en cualquier link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });

    // Cerrar con Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        burger.focus();
      }
    });
  }

  // 3. Suavizado de anclajes (excluyendo el rail del ScrollWorld que tiene su propio controlador)
  document.querySelectorAll('a[href^="#"]:not([data-goto])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
