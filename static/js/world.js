/**
 * ==============================================================================
 * EL AJÍ SECO DEL MAR — SCROLL WORLD CINEMÁTICO (ARKO SUSHI ARCHITECTURE)
 * Transiciones de fotogramas reales de El Ají Seco con GSAP ScrollTrigger
 * y Lenis Smooth Scroll.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  function piecewise(y, keys) {
    if (y <= keys[0].y) return keys[0].v;
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1];
      const b = keys[i];
      if (y <= b.y) return a.v + (b.v - a.v) * ((y - a.y) / (b.y - a.y || 1));
    }
    return keys[keys.length - 1].v;
  }

  function clamp(val, min = 0, max = 1) {
    return Math.max(min, Math.min(max, val));
  }

  function initWorld(world, reduceMotion) {
    const stage = world.querySelector('[data-stage]');
    if (!stage) return;

    const stops = Array.from(world.querySelectorAll('[data-stop]'));
    const frames = Array.from(stage.querySelectorAll('[data-frame]'));
    const links = Array.from(stage.querySelectorAll('[data-goto]'));
    const fill = stage.querySelector('[data-rail-fill]');
    const hint = stage.querySelector('[data-hint]');
    const clips = Array.from(stage.querySelectorAll('[data-clip]'));
    const last = stops.length - 1;
    const focus = stops.map((stop) => Number(stop.dataset.focus || 50));

    // Cada parada llega cuando su artículo toca el borde superior
    const marks = stops.map((stop) =>
      window.ScrollTrigger.create({ trigger: stop, start: 'top top' })
    );

    let current = -1;
    let w = 0;

    const setCurrent = (index) => {
      if (index === current) return;
      current = index;
      stops.forEach((stop, i) => stop.classList.toggle('is-current', i === index));
      links.forEach((link, i) => link.setAttribute('aria-current', String(i === index)));
    };

    const render = (self) => {
      const y = self.scroll();
      w = piecewise(y, [
        ...marks.map((mark, i) => ({ y: mark.start, v: i })),
        { y: self.end, v: stops.length }
      ]);
      const at = Math.min(w, last);

      setCurrent(Math.round(at));
      stage.style.setProperty(
        '--focus-x',
        `${piecewise(y, marks.map((mark, i) => ({ y: mark.start, v: focus[i] })))}%`
      );

      if (fill) fill.style.transform = `scaleY(${at / last})`;
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
          const scale = 1 + 0.05 * clamp(w - i + 0.5);
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
  }

  window.initWorld = initWorld;
})(window);
