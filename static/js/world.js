/**
 * ==============================================================================
 * EL AJÍ SECO DEL MAR — SCROLL WORLD CINEMÁTICO (ARKO SUSHI ARCHITECTURE)
 * Transiciones de fotogramas reales de El Ají Seco con GSAP ScrollTrigger
 * y Lenis Smooth Scroll.
 * 
 * Arquitectura a prueba de fallos:
 * - Detección matemática robusta (sin riesgo de NaN en cálculos de posición).
 * - Fallback continuo garantizado ante cargas asíncronas de imágenes.
 * - Soporte nativo para eventos táctiles (touch-action pan-y).
 * ==============================================================================
 */

(function (window) {
  'use strict';

  function clamp(val, min = 0, max = 1) {
    const num = Number(val);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  function piecewise(y, keys) {
    if (!keys || keys.length === 0) return 0;
    const valid = keys
      .map((k) => ({
        y: typeof k.y === 'number' && !isNaN(k.y) ? k.y : 0,
        v: Number(k.v) || 0,
      }))
      .sort((a, b) => a.y - b.y);

    if (y <= valid[0].y) return valid[0].v;
    for (let i = 1; i < valid.length; i++) {
      const a = valid[i - 1];
      const b = valid[i];
      if (y <= b.y) {
        const span = b.y - a.y;
        if (span <= 0) return a.v;
        return a.v + (b.v - a.v) * ((y - a.y) / span);
      }
    }
    return valid[valid.length - 1].v;
  }

  function initWorld(world, reduceMotion) {
    const stage = world.querySelector('[data-stage]');
    if (!stage) return;

    const stops = Array.from(world.querySelectorAll('[data-stop]'));
    const frames = Array.from(stage.querySelectorAll('[data-frame]'));
    const links = Array.from(stage.querySelectorAll('[data-goto]'));
    const fill = stage.querySelector('[data-rail-fill]');
    const hint = stage.querySelector('[data-hint]');
    const last = stops.length - 1;
    const focus = stops.map((stop) => Number(stop.dataset.focus || 50));

    if (stops.length === 0 || frames.length === 0) return;

    // Crear triggers para cada parada
    const marks = stops.map((stop) =>
      window.ScrollTrigger.create({ trigger: stop, start: 'top top' })
    );

    let current = -1;
    let w = 0;

    const setCurrent = (index) => {
      const safeIndex = clamp(index, 0, last);
      if (safeIndex === current) return;
      current = safeIndex;
      stops.forEach((stop, i) => stop.classList.toggle('is-current', i === safeIndex));
      links.forEach((link, i) => link.setAttribute('aria-current', String(i === safeIndex)));
    };

    const render = (self) => {
      const scrollY = (self && typeof self.scroll === 'function')
        ? self.scroll()
        : (window.scrollY || window.pageYOffset || 0);

      const worldRect = world.getBoundingClientRect();
      const worldTop = worldRect.top + scrollY;
      const worldHeight = world.offsetHeight || (window.innerHeight * stops.length);
      const stepHeight = worldHeight / stops.length;

      // Calcular posiciones de cada parada de forma infalible
      const keys = stops.map((stop, i) => {
        const trigger = marks[i];
        const triggerStart = (trigger && typeof trigger.start === 'number' && !isNaN(trigger.start) && trigger.start > 0)
          ? trigger.start
          : (worldTop + i * stepHeight);
        return { y: triggerStart, v: i };
      });

      const totalEnd = (self && typeof self.end === 'number' && !isNaN(self.end) && self.end > 0)
        ? self.end
        : (worldTop + worldHeight);
      keys.push({ y: totalEnd, v: stops.length });

      let rawW = piecewise(scrollY, keys);
      if (isNaN(rawW)) rawW = 0;
      w = clamp(rawW, 0, last);
      const at = Math.min(w, last);
      const targetIndex = clamp(Math.round(at), 0, last);

      setCurrent(targetIndex);

      stage.style.setProperty(
        '--focus-x',
        `${piecewise(scrollY, marks.map((mark, i) => ({ y: (mark && typeof mark.start === 'number') ? mark.start : i * stepHeight, v: focus[i] })))}%`
      );

      if (fill) fill.style.transform = `scaleY(${at / (last || 1)})`;
      if (hint) hint.style.opacity = String(clamp(1 - w * 4));

      // Fotogramas reales de El Ají Seco: transición suave y escala cinemática
      frames.forEach((frame, i) => {
        let opacity = 0;
        if (i === 0) {
          if (w <= 0.4) {
            opacity = 1;
          } else if (w < 1.0) {
            opacity = clamp(1 - (w - 0.4) / 0.6);
          } else {
            opacity = 0;
          }
        } else {
          const enterStart = i - 0.7;
          const exitEnd = i + 0.8;
          if (w >= enterStart && w <= i) {
            opacity = clamp((w - enterStart) / 0.7);
          } else if (w > i && w <= exitEnd && i < last) {
            opacity = clamp(1 - (w - i) / 0.8);
          } else if (w >= i && i === last) {
            opacity = 1;
          }
        }
        frame.style.opacity = opacity.toFixed(3);
        if (!reduceMotion) {
          const scale = 1 + 0.04 * clamp(w - i + 0.5);
          frame.style.transform = `scale(${scale.toFixed(4)})`;
        }
      });
    };

    const span = window.ScrollTrigger.create({
      trigger: world,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: render,
      onRefresh: render,
    });

    render(span);

    // Navegación con clic suave en los puntos del rail lateral
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            if (window.lenis) {
              window.lenis.scrollTo(targetEl);
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });

    // Refresco automático de ScrollTrigger una vez cargados todos los activos
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
      window.addEventListener('load', () => window.ScrollTrigger.refresh(), { once: true });
    }
  }

  window.initWorld = initWorld;
})(window);
