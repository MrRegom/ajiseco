/**
 * EL AJÍ SECO DEL MAR — TÚNEL ESPACIAL 3D GASTRONÓMICO
 * Adaptación de alto rendimiento basada en espiral áurea y perspectiva tridimensional.
 * Desplazamiento por rueda, touch y parallax reactivo al cursor.
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('experiencia3d') || document.getElementById('tunnel-stage');
  const cardsContainer = document.getElementById('tunnel-cards-group');
  const titleElem = document.getElementById('tunnel-title-block');
  const promptElem = document.getElementById('tunnel-scroll-prompt');

  if (!container || !cardsContainer) return;

  const cardsData = [
    { title: "Causa Limeña de Centolla", cat: "Entrada Fría", img: "static/img/causa-limena.png" },
    { title: "Ceviche Clásico de Corvina", cat: "Pesca del Día", img: "static/img/cebiche-clasico.png" },
    { title: "Lomo Saltado al Wok", cat: "Fuego Criollo", img: "static/img/lomo-saltado-wok.png" },
    { title: "Pisco Sour Catedral", cat: "Coctelería de Autor", img: "static/img/pisco-sour-catedral.png" },
    { title: "Tiradito a los Tres Ajíes", cat: "Tradición Marina", img: "static/img/terraza-vina.png" },
    { title: "Pescado a lo Macho", cat: "Especialidad Criolla", img: "static/img/mariscos-fuego.png" },
    { title: "Salón San Martín 230", cat: "Viña del Mar", img: "static/img/salon-san-martin.png" },
    { title: "Entrada San Martín", cat: "Nuestra Fachada", img: "static/img/entrada-san-martin.png" },
  ];

  const total = cardsData.length;
  let targetProgress = 0;
  let currentProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;

  // Crear elementos del dom de las tarjetas
  const cardElements = cardsData.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    const radiusFactorX = 0.28 + (i % 3) * 0.08;
    const radiusFactorY = 0.26 + (i % 2) * 0.09;
    const rotationZ = (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2);

    const card = document.createElement('div');
    card.className = 'tunnel-card-item';
    card.innerHTML = `
      <div class="tunnel-card-inner">
        <img src="${item.img}" alt="${item.title}" loading="lazy">
        <div class="tunnel-card-overlay">
          <span class="tunnel-card-cat">${item.cat}</span>
          <span class="tunnel-card-title">${item.title}</span>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);

    return {
      el: card,
      item,
      angleCos: Math.cos(goldenAngle),
      angleSin: Math.sin(goldenAngle),
      radiusFactorX,
      radiusFactorY,
      rotationZ,
      index: i
    };
  });

  // Parallax del puntero
  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Control reactivo por scroll de la página dentro del viewport
  window.addEventListener('scroll', () => {
    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top < vh && rect.bottom > 0) {
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.75)));
      targetProgress = progress;
    }
  }, { passive: true });

  // Control interactivo adicional por arrastre o rueda al interactuar directamente
  container.addEventListener('wheel', (e) => {
    const delta = e.deltaY * 0.0006;
    targetProgress = Math.max(0, Math.min(1, targetProgress + delta));
  }, { passive: true });

  // Gestos táctiles
  let touchStartY = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;
      targetProgress = Math.max(0, Math.min(1, targetProgress + deltaY * 0.0015));
    }
  }, { passive: true });

  // Bucle de animación (Smooth Spring Physics)
  function render() {
    requestAnimationFrame(render);

    // Interpolación suave del progreso y puntero
    currentProgress += (targetProgress - currentProgress) * 0.075;
    currentPointerX += (pointerX - currentPointerX) * 0.08;
    currentPointerY += (pointerY - currentPointerY) * 0.08;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    const farZ = isMobile ? -1100 : -1650;
    const nearZ = isMobile ? 320 : 480;
    const panStrength = isMobile ? 18 : 38;

    const staggerSpan = 0.55;

    // Actualizar tarjetas
    cardElements.forEach(c => {
      const start = (c.index / total) * (1 - staggerSpan);
      const end = start + staggerSpan;

      let localProgress = (currentProgress - start) / (end - start);
      localProgress = Math.max(0, Math.min(1, localProgress));

      const z = farZ + localProgress * (nearZ - farZ);

      // Opacidad con entrada y salida suaves
      let opacity = 0;
      if (localProgress < 0.18) {
        opacity = localProgress / 0.18;
      } else if (localProgress <= 0.82) {
        opacity = 1;
      } else if (localProgress <= 0.98) {
        opacity = 1 - (localProgress - 0.82) / 0.16;
      }

      const baseX = c.angleCos * (width * c.radiusFactorX);
      const baseY = c.angleSin * (height * c.radiusFactorY);
      const offsetX = baseX - currentPointerX * panStrength;
      const offsetY = baseY - currentPointerY * panStrength;

      c.el.style.transform = `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${z}px) rotateZ(${c.rotationZ}deg)`;
      c.el.style.opacity = opacity.toFixed(3);
      c.el.style.zIndex = c.index + 1;
      c.el.style.display = opacity < 0.01 ? 'none' : 'block';
    });

    // Animar textos del título central
    if (titleElem) {
      const scale = 0.9 + currentProgress * 0.25;
      let titleOp = 1;
      if (currentProgress < 0.15) {
        titleOp = 0.4 + (currentProgress / 0.15) * 0.6;
      } else if (currentProgress > 0.8) {
        titleOp = Math.max(0, 1 - (currentProgress - 0.8) / 0.2);
      }
      titleElem.style.transform = `scale(${scale.toFixed(3)})`;
      titleElem.style.opacity = titleOp.toFixed(3);
    }

    if (promptElem) {
      const promptOp = Math.max(0, 1 - currentProgress * 6);
      promptElem.style.opacity = promptOp.toFixed(3);
    }
  }

  render();
});
