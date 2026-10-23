/**
 * ==============================================================================
 * EL AJÍ SECO DEL MAR — SCROLL WORLD CINEMÁTICO (ARKO SUSHI STYLE)
 * Módulo de Navegación Inmersiva por Paradas con Desplazamiento Suave
 * y Fotogramas con Zoom Parallax Progresivo.
 * 
 * Principios: SOLID, Cero dependencias pesadas, 60fps con requestAnimationFrame,
 * Soporte para prefers-reduced-motion y enlaces por rail lateral interactivo.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initScrollWorld() {
    const world = document.querySelector('[data-world]');
    if (!world) return;

    const stage = world.querySelector('[data-stage]');
    if (!stage) return;

    const stops = Array.from(world.querySelectorAll('[data-stop]'));
    const frames = Array.from(stage.querySelectorAll('[data-frame]'));
    const links = Array.from(stage.querySelectorAll('[data-goto]'));
    const fill = stage.querySelector('[data-rail-fill]');
    const hint = stage.querySelector('[data-hint]');

    if (stops.length === 0 || frames.length === 0) return;

    const numStops = stops.length;
    const lastIndex = numStops - 1;

    // Detectar preferencias de accesibilidad de movimiento
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = -1;
    let ticking = false;

    /**
     * Interpola linealmente tramos (piecewise interpolation)
     */
    function interpolatePiecewise(y, keys) {
      if (y <= keys[0].y) return keys[0].v;
      for (let i = 1; i < keys.length; i++) {
        const prev = keys[i - 1];
        const next = keys[i];
        if (y <= next.y) {
          const deltaY = next.y - prev.y || 1;
          const t = (y - prev.y) / deltaY;
          return prev.v + (next.v - prev.v) * t;
        }
      }
      return keys[keys.length - 1].v;
    }

    /**
     * Actualiza la parada activa en el rail y en el texto
     */
    function setCurrentStop(index) {
      if (index === currentIndex) return;
      currentIndex = index;

      stops.forEach((stop, i) => {
        stop.classList.toggle('is-current', i === index);
      });

      links.forEach((link, i) => {
        const isActive = i === index;
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    /**
     * Renderizador en cada frame de scroll
     */
    function updateStage() {
      ticking = false;

      const worldRect = world.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const worldTop = worldRect.top + scrollY;
      const worldHeight = world.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollEnd = worldTop + worldHeight - viewportHeight;

      // Calcular posiciones de cada parada relativas al scroll global
      const keys = stops.map((stop, i) => {
        const stopRect = stop.getBoundingClientRect();
        return {
          y: stopRect.top + scrollY,
          v: i
        };
      });

      // Añadir clave final
      keys.push({ y: scrollEnd, v: lastIndex });

      // Obtener el valor continuo w (posición fraccional en el recorrido)
      const currentY = scrollY;
      const w = interpolatePiecewise(currentY, keys);
      const clampedW = Math.max(0, Math.min(lastIndex, w));

      // 1. Actualizar parada activa
      const activeIdx = Math.round(clampedW);
      setCurrentStop(activeIdx);

      // 2. Actualizar barra de progreso del rail lateral
      if (fill) {
        const progress = clampedW / lastIndex;
        fill.style.transform = `scaleY(${progress.toFixed(4)})`;
      }

      // 3. Ocultar pista de desplazamiento al avanzar
      if (hint) {
        const hintOpacity = Math.max(0, 1 - clampedW * 3.5);
        hint.style.opacity = hintOpacity.toFixed(2);
        hint.style.pointerEvents = hintOpacity < 0.1 ? 'none' : 'auto';
      }

      // 4. Calcular opacidades y escala fotográfica de cada escena
      frames.forEach((frame, i) => {
        let opacity = 0;

        if (i === 0) {
          // El primer fotograma está al 100% al inicio y se desvanece suavemente
          if (clampedW <= 0.4) {
            opacity = 1;
          } else if (clampedW < 1.0) {
            opacity = Math.max(0, 1 - (clampedW - 0.4) / 0.6);
          } else {
            opacity = 0;
          }
        } else {
          // Cada fotograma subsiguiente entra en la segunda mitad del tramo anterior
          const enterStart = i - 0.7;
          const exitEnd = i + 0.8;

          if (clampedW >= enterStart && clampedW <= i) {
            opacity = Math.max(0, Math.min(1, (clampedW - enterStart) / 0.7));
          } else if (clampedW > i && clampedW <= exitEnd && i < lastIndex) {
            opacity = Math.max(0, Math.min(1, 1 - (clampedW - i) / 0.8));
          } else if (clampedW >= i && i === lastIndex) {
            opacity = 1;
          }
        }

        frame.style.opacity = opacity.toFixed(3);

        if (!prefersReducedMotion) {
          // Ligero zoom de aproximación como en Arko Sushi
          const scaleDelta = Math.max(0, Math.min(1, clampedW - i + 0.5));
          const scale = 1 + 0.05 * scaleDelta;
          frame.style.transform = `scale(${scale.toFixed(4)})`;
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateStage);
        ticking = true;
      }
    }

    // Escuchar scroll y resize con pasividad
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Navegación con clic suave en los puntos del rail lateral
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const targetRect = targetEl.getBoundingClientRect();
            const targetTop = targetRect.top + window.scrollY;
            window.scrollTo({
              top: targetTop,
              behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
          }
        }
      });
    });

    // Inicializar estado de inmediato
    updateStage();
  }

  // Ejecución segura tras DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollWorld);
  } else {
    initScrollWorld();
  }
})();
