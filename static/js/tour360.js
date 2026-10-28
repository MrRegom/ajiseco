/**
 * Tour 360° VR Inmersivo para Restaurantes - "TuEndpoint"
 * Desarrollado con Three.js WebGL & Clean Architecture Frontend.
 * Control por Arrastre Suave, Giroscopio Móvil, Radar Interactivo y Hotspots 3D.
 */

(function () {
  'use strict';

  // Configuración y Estado Global
  const STATE = {
    manifest: null,
    currentSceneId: null,
    isUserInteracting: false,
    lon: 15,
    lat: -4,
    targetLon: 15,
    targetLat: -4,
    onPointerDownPointerX: 0,
    onPointerDownPointerY: 0,
    onPointerDownLon: 0,
    onPointerDownLat: 0,
    fov: 75,
    targetFov: 75,
    autoRotate: true,
    lastInteractionTime: Date.now(),
    isGyroActive: false,
    gyroAlpha: 0,
    gyroBeta: 0,
    gyroGamma: 0,
    touchDistanceStart: 0,
    activeModal: null
  };

  // Three.js Core
  let scene, camera, renderer, sphereMeshA, sphereMeshB, textureLoader;
  let activeSphere = 'A';
  let isTransitioning = false;
  let currentHotspots = [];

  // Elementos del DOM
  const dom = {
    viewport: document.getElementById('tour360-viewport'),
    hotspotsLayer: document.getElementById('hotspots-layer'),
    dock: document.getElementById('tour-dock'),
    radarWrap: document.getElementById('radar-canvas-wrap'),
    radarCone: document.getElementById('radar-cone'),
    btnAutoRotate: document.getElementById('btn-auto-rotate'),
    btnGyro: document.getElementById('btn-gyro'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnB2B: document.getElementById('btn-b2b'),
    modalBackdrop: document.getElementById('tour-modal-backdrop'),
    modalContainer: document.getElementById('tour-modal-container'),
    gyroNotice: document.getElementById('gyro-notice')
  };

  /**
   * Inicialización del Módulo
   */
  function init(manifestData) {
    if (!manifestData || !manifestData.scenes || manifestData.scenes.length === 0) {
      console.error('[Tour360] Manifiesto inválido o vacío.');
      return;
    }

    STATE.manifest = manifestData;
    setupThree();
    setupDock();
    setupRadar();
    setupEventListeners();
    setupModals();

    // Cargar escena inicial
    const initialSceneId = STATE.manifest.default_scene_id || STATE.manifest.scenes[0].id;
    switchScene(initialSceneId, true);

    // Bucle de Animación
    requestAnimationFrame(animate);
  }

  /**
   * Configuración de Three.js Scene, Camera y Renderer
   */
  function setupThree() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(STATE.fov, width / height, 1, 1200);
    camera.target = new THREE.Vector3(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      canvas: dom.viewport,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    textureLoader = new THREE.TextureLoader();

    // Esfera A (Activa Principal)
    const geometryA = new THREE.SphereGeometry(500, 64, 32);
    geometryA.scale(-1, 1, 1); // Invertir normales para ver desde el interior
    const materialA = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1
    });
    sphereMeshA = new THREE.Mesh(geometryA, materialA);
    scene.add(sphereMeshA);

    // Esfera B (Para crossfade suave entre salones)
    const geometryB = new THREE.SphereGeometry(498, 64, 32);
    geometryB.scale(-1, 1, 1);
    const materialB = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0
    });
    sphereMeshB = new THREE.Mesh(geometryB, materialB);
    sphereMeshB.visible = false;
    scene.add(sphereMeshB);
  }

  /**
   * Transición Cinemática entre Salones
   */
  function switchScene(sceneId, isInitial = false) {
    if (isTransitioning && !isInitial) return;

    const sceneData = STATE.manifest.scenes.find(s => s.id === sceneId);
    if (!sceneData) return;

    STATE.currentSceneId = sceneId;
    updateDockState(sceneId);
    updateRadarState(sceneId);

    // Orientación inicial sugerida para la escena
    if (sceneData.initial_view) {
      STATE.targetLon = sceneData.initial_view.yaw || 0;
      STATE.targetLat = sceneData.initial_view.pitch || 0;
      if (isInitial) {
        STATE.lon = STATE.targetLon;
        STATE.lat = STATE.targetLat;
      }
    }

    const imgUrl = sceneData.image_webp || sceneData.image_jpg;

    if (isInitial) {
      textureLoader.load(imgUrl, function (tex) {
        tex.minFilter = THREE.LinearFilter;
        sphereMeshA.material.map = tex;
        sphereMeshA.material.needsUpdate = true;
        renderHotspots(sceneData.hotspots || []);
      });
      return;
    }

    // Transición suave con esfera B
    isTransitioning = true;
    clearHotspots();

    textureLoader.load(imgUrl, function (tex) {
      tex.minFilter = THREE.LinearFilter;
      const incomingSphere = activeSphere === 'A' ? sphereMeshB : sphereMeshA;
      const currentSphere = activeSphere === 'A' ? sphereMeshA : sphereMeshB;

      incomingSphere.material.map = tex;
      incomingSphere.material.opacity = 0;
      incomingSphere.visible = true;
      incomingSphere.material.needsUpdate = true;

      // Animación de Warp / Crossfade
      let progress = 0;
      const duration = 650; // ms
      const startTime = performance.now();

      function step(now) {
        progress = Math.min((now - startTime) / duration, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

        incomingSphere.material.opacity = ease;
        currentSphere.material.opacity = 1 - ease;

        // Efecto warp dinámico de FOV (zoom-in suave durante el salto)
        const fovWarp = Math.sin(progress * Math.PI) * 12;
        camera.fov = STATE.fov - fovWarp;
        camera.updateProjectionMatrix();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Terminado el crossfade
          currentSphere.visible = false;
          activeSphere = activeSphere === 'A' ? 'B' : 'A';
          isTransitioning = false;
          camera.fov = STATE.fov;
          camera.updateProjectionMatrix();
          renderHotspots(sceneData.hotspots || []);
        }
      }

      requestAnimationFrame(step);
    });
  }

  /**
   * Renderizado de Hotspots 3D Proyectados en Pantalla
   */
  function renderHotspots(hotspots) {
    clearHotspots();
    currentHotspots = [];

    hotspots.forEach(hs => {
      // Cálculo de coordenadas esféricas a 3D cartesiano
      const phi = THREE.MathUtils.degToRad(90 - hs.pitch);
      const theta = THREE.MathUtils.degToRad(hs.yaw);
      const radius = 480;

      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );

      // Crear elemento DOM flotante
      const node = document.createElement('div');
      node.className = `hotspot-node type-${hs.type}`;
      node.setAttribute('data-id', hs.id);

      // Icono según tipo
      let icon = '📍';
      if (hs.type === 'table') icon = '🍽️';
      else if (hs.type === 'dish') icon = '⭐';
      else if (hs.type === 'portal') icon = '🚪';
      else if (hs.type === 'info') icon = 'ℹ️';

      node.innerHTML = `
        <div class="hotspot-ring"></div>
        <div class="hotspot-core">${icon}</div>
        <div class="hotspot-label">${escapeHtml(hs.title)}</div>
      `;

      // Evento Click
      node.addEventListener('click', function (e) {
        e.stopPropagation();
        handleHotspotClick(hs);
      });

      dom.hotspotsLayer.appendChild(node);
      currentHotspots.push({ element: node, position: position, data: hs });
    });
  }

  function clearHotspots() {
    dom.hotspotsLayer.innerHTML = '';
    currentHotspots = [];
  }

  /**
   * Actualizar posición 2D de Hotspots en Pantalla según la cámara
   */
  function updateHotspotsProjection() {
    if (currentHotspots.length === 0) return;

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    currentHotspots.forEach(item => {
      const v = item.position.clone();
      v.project(camera);

      // Si está detrás de la cámara (z > 1), ocultar
      if (v.z > 1) {
        item.element.style.display = 'none';
      } else {
        item.element.style.display = 'flex';
        const screenX = (v.x * widthHalf) + widthHalf;
        const screenY = -(v.y * heightHalf) + heightHalf;
        item.element.style.left = `${screenX}px`;
        item.element.style.top = `${screenY}px`;
      }
    });
  }

  /**
   * Interacciones de Hotspots (Mesa, Plato, Portal, Info)
   */
  function handleHotspotClick(hs) {
    if (hs.type === 'portal') {
      if (hs.target_scene) {
        switchScene(hs.target_scene);
      }
      return;
    }

    if (hs.type === 'table') {
      openReservationModal(hs);
      return;
    }

    if (hs.type === 'dish') {
      openDishModal(hs);
      return;
    }

    if (hs.type === 'info') {
      openInfoModal(hs);
      return;
    }
  }

  /**
   * Modal: Reserva de Mesa Específica en 360°
   */
  function openReservationModal(tableData) {
    const currentScene = STATE.manifest.scenes.find(s => s.id === STATE.currentSceneId);
    const sceneName = currentScene ? currentScene.name : 'Salón TuEndpoint';

    const html = `
      <div class="tour-modal-card">
        <button class="modal-close-btn" id="modal-close" aria-label="Cerrar modal">&times;</button>
        <span class="modal-badge">${tableData.badge || 'Reserva en 360°'}</span>
        <h3 class="modal-title">${escapeHtml(tableData.title)}</h3>
        <p class="modal-subtitle">${escapeHtml(tableData.description)}</p>

        <div class="modal-meta-grid">
          <div>
            <div class="meta-item-label">Zona del Restaurante</div>
            <div class="meta-item-value">${escapeHtml(sceneName)}</div>
          </div>
          <div>
            <div class="meta-item-label">Capacidad Recomendada</div>
            <div class="meta-item-value">${tableData.capacity || 4} Personas</div>
          </div>
          <div>
            <div class="meta-item-label">Consumo Mínimo Sugerido</div>
            <div class="meta-item-value">${tableData.min_consumption || '$25.000'}</div>
          </div>
          <div>
            <div class="meta-item-label">Estado de Mesa</div>
            <div class="meta-item-value" style="color: var(--color-emerald);">● Confirmación Inmediata</div>
          </div>
        </div>

        <form class="reserve-form" id="form-reserve-table">
          <div class="form-group">
            <label class="form-label" for="res-name">Nombre y Apellido</label>
            <input type="text" id="res-name" class="form-input" placeholder="Ej: Carlos Silva" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="res-phone">Teléfono / WhatsApp</label>
            <input type="tel" id="res-phone" class="form-input" placeholder="+56 9 1234 5678" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" for="res-date">Fecha</label>
              <input type="date" id="res-date" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="res-time">Horario</label>
              <select id="res-time" class="form-select" required>
                <option value="13:30">13:30 hrs (Almuerzo)</option>
                <option value="15:00">15:00 hrs</option>
                <option value="20:00" selected>20:00 hrs (Cena)</option>
                <option value="21:30">21:30 hrs</option>
                <option value="22:30">22:30 hrs (Lounge)</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-confirm-reserve">
            <span>Confirmar Selección por WhatsApp</span>
            <span>📱</span>
          </button>
        </form>
      </div>
    `;

    showModal(html);

    // Fijar fecha mínima en hoy
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Manejar submit
    const form = document.getElementById('form-reserve-table');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('res-name').value;
        const phone = document.getElementById('res-phone').value;
        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;

        const msg = `¡Hola TuEndpoint! Quiero reservar desde el Tour 360° VR:%0A` +
          `• *Mesa:* ${encodeURIComponent(tableData.title)}%0A` +
          `• *Zona:* ${encodeURIComponent(sceneName)}%0A` +
          `• *Nombre:* ${encodeURIComponent(name)}%0A` +
          `• *Teléfono:* ${encodeURIComponent(phone)}%0A` +
          `• *Fecha:* ${encodeURIComponent(date)}%0A` +
          `• *Horario:* ${encodeURIComponent(time)}`;

        const waUrl = `https://wa.me/56945678900?text=${msg}`;
        window.open(waUrl, '_blank');
        closeModal();
      });
    }
  }

  /**
   * Modal: Plato o Cóctel Signature
   */
  function openDishModal(dishData) {
    const html = `
      <div class="tour-modal-card">
        <button class="modal-close-btn" id="modal-close" aria-label="Cerrar modal">&times;</button>
        <span class="modal-badge">${dishData.badge || 'Especialidad'}</span>
        <h3 class="modal-title">${escapeHtml(dishData.title)}</h3>
        <p class="modal-subtitle">${escapeHtml(dishData.description)}</p>

        ${dishData.image ? `
          <div style="width: 100%; height: 210px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 18px; border: 1px solid var(--border-subtle); background: #000;">
            <img src="${dishData.image}" alt="${escapeHtml(dishData.title)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        ` : ''}

        <div class="modal-meta-grid">
          <div>
            <div class="meta-item-label">Precio Sugerido</div>
            <div class="meta-item-value" style="color: var(--color-gold);">${dishData.price || '$14.900'}</div>
          </div>
          <div>
            <div class="meta-item-label">Maridaje Recomendado</div>
            <div class="meta-item-value">Sauvignon Blanc / Pisco Sour</div>
          </div>
        </div>

        <button type="button" class="btn-confirm-reserve" id="btn-order-dish">
          <span>Añadir a mi Comanda / Preguntar</span>
          <span>🍸</span>
        </button>
      </div>
    `;

    showModal(html);

    const btnOrder = document.getElementById('btn-order-dish');
    if (btnOrder) {
      btnOrder.addEventListener('click', function () {
        const msg = `Hola TuEndpoint, vi el plato en el Tour 360° VR: *${encodeURIComponent(dishData.title)}* (${encodeURIComponent(dishData.price || '')}) y quiero información sobre disponibilidad y reservas.`;
        window.open(`https://wa.me/56945678900?text=${msg}`, '_blank');
        closeModal();
      });
    }
  }

  /**
   * Modal: Información General
   */
  function openInfoModal(infoData) {
    const html = `
      <div class="tour-modal-card">
        <button class="modal-close-btn" id="modal-close" aria-label="Cerrar modal">&times;</button>
        <span class="modal-badge">${infoData.badge || 'Detalle del Espacio'}</span>
        <h3 class="modal-title">${escapeHtml(infoData.title)}</h3>
        <p class="modal-subtitle" style="font-size: 1rem; line-height: 1.6;">${escapeHtml(infoData.description)}</p>
      </div>
    `;
    showModal(html);
  }

  /**
   * Modal: Oferta B2B para Restaurantes ("¿Por qué tener este Tour 360°?")
   */
  function openB2BModal() {
    const benefits = STATE.manifest.b2b_benefits || [];

    const benefitsHtml = benefits.map(b => `
      <div class="b2b-benefit-card">
        <span class="b2b-icon">✨</span>
        <div>
          <div class="b2b-benefit-title">${escapeHtml(b.title)}</div>
          <div class="b2b-benefit-desc">${escapeHtml(b.description)}</div>
        </div>
      </div>
    `).join('');

    const html = `
      <div class="tour-modal-card" style="max-width: 600px;">
        <button class="modal-close-btn" id="modal-close" aria-label="Cerrar modal">&times;</button>
        <span class="modal-badge">Demo Comercial TuEndpoint Tech</span>
        <h3 class="modal-title">¿Quieres este formato 360° para tu Restaurante?</h3>
        <p class="modal-subtitle">
          Transforma comensales digitales en clientes reales. Un recorrido inmersivo que permite reservar mesas específicas, admirar la coctelería y exhibir la experiencia antes de salir de casa.
        </p>

        <div style="margin: 18px 0;">
          ${benefitsHtml}
        </div>

        <a href="https://wa.me/56945678900?text=Hola%20TuEndpoint%2C%20quiero%20cotizar%20un%20Tour%20360%20VR%20para%20mi%20restaurante" target="_blank" rel="noopener noreferrer" class="btn-quote-b2b">
          <span>Cotizar Tour 360° para mi Local</span>
          <span>🚀</span>
        </a>
      </div>
    `;

    showModal(html);
  }

  function showModal(html) {
    dom.modalContainer.innerHTML = html;
    dom.modalBackdrop.classList.add('is-open');

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
  }

  function closeModal() {
    dom.modalBackdrop.classList.remove('is-open');
    setTimeout(() => {
      dom.modalContainer.innerHTML = '';
    }, 300);
  }

  function setupModals() {
    dom.modalBackdrop.addEventListener('click', function (e) {
      if (e.target === dom.modalBackdrop) {
        closeModal();
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  /**
   * Dock Inferior: Selección de Salones
   */
  function setupDock() {
    dom.dock.innerHTML = '';

    STATE.manifest.scenes.forEach(sceneItem => {
      const btn = document.createElement('button');
      btn.className = 'dock-pill';
      btn.setAttribute('data-scene-id', sceneItem.id);

      let icon = '🍽️';
      if (sceneItem.id.includes('bar')) icon = '🍸';
      if (sceneItem.id.includes('cava')) icon = '🍷';
      if (sceneItem.id.includes('terraza')) icon = '🌅';

      btn.innerHTML = `<span class="dock-pill-icon">${icon}</span><span>${escapeHtml(sceneItem.name)}</span>`;

      btn.addEventListener('click', function () {
        switchScene(sceneItem.id);
      });

      dom.dock.appendChild(btn);
    });
  }

  function updateDockState(sceneId) {
    const pills = dom.dock.querySelectorAll('.dock-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-scene-id') === sceneId) {
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });
  }

  /**
   * Plano Radar Interactivo (Floor Plan Minimap)
   */
  function setupRadar() {
    const radarPlan = STATE.manifest.radar_plan;
    if (!radarPlan || !radarPlan.zones) return;

    dom.radarWrap.innerHTML = '';

    // Agregar cono de visión
    const cone = document.createElement('div');
    cone.id = 'radar-cone';
    cone.className = 'radar-cone';
    cone.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; opacity: 0.45; overflow: visible;">
        <path d="M 50 50 L 20 5 A 45 45 0 0 1 80 5 Z" fill="url(#radarGradient)" />
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#E5A93C" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#E5A93C" stop-opacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    `;
    dom.radarWrap.appendChild(cone);

    // Pines de cada salón
    radarPlan.zones.forEach(zone => {
      const pin = document.createElement('div');
      pin.className = 'radar-pin';
      pin.setAttribute('data-zone-id', zone.id);
      pin.title = zone.name;
      pin.style.left = `${zone.x}%`;
      pin.style.top = `${zone.y}%`;

      pin.addEventListener('click', function () {
        switchScene(zone.id);
      });

      dom.radarWrap.appendChild(pin);
    });
  }

  function updateRadarState(sceneId) {
    const pins = dom.radarWrap.querySelectorAll('.radar-pin');
    pins.forEach(pin => {
      if (pin.getAttribute('data-zone-id') === sceneId) {
        pin.classList.add('is-active');
        // Posicionar el centro del cono en el pin activo
        const cone = document.getElementById('radar-cone');
        if (cone) {
          cone.style.left = `calc(${pin.style.left} - 25px)`;
          cone.style.top = `calc(${pin.style.top} - 25px)`;
        }
      } else {
        pin.classList.remove('is-active');
      }
    });
  }

  function updateRadarConeAngle() {
    const cone = document.getElementById('radar-cone');
    if (!cone) return;
    // Rotar cono de radar en dirección contraria a lon
    const deg = -STATE.lon;
    cone.style.transform = `rotate(${deg}deg)`;
  }

  /**
   * Eventos de Ratón, Touch y Giroscopio
   */
  function setupEventListeners() {
    // Redimensionamiento
    window.addEventListener('resize', onWindowResize);

    // Arrastre con puntero
    dom.viewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Rueda del ratón para Zoom (FOV)
    dom.viewport.addEventListener('wheel', onDocumentMouseWheel, { passive: false });

    // Touch Pinch Zoom
    dom.viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.viewport.addEventListener('touchmove', onTouchMove, { passive: false });

    // Controles de cabecera HUD
    if (dom.btnAutoRotate) {
      dom.btnAutoRotate.addEventListener('click', toggleAutoRotate);
    }
    if (dom.btnGyro) {
      dom.btnGyro.addEventListener('click', toggleGyroscope);
    }
    if (dom.btnFullscreen) {
      dom.btnFullscreen.addEventListener('click', toggleFullscreen);
    }
    if (dom.btnB2B) {
      dom.btnB2B.addEventListener('click', openB2BModal);
    }
  }

  function onPointerDown(event) {
    if (event.isPrimary === false) return;
    STATE.isUserInteracting = true;
    STATE.lastInteractionTime = Date.now();

    STATE.onPointerDownPointerX = event.clientX;
    STATE.onPointerDownPointerY = event.clientY;

    STATE.onPointerDownLon = STATE.targetLon;
    STATE.onPointerDownLat = STATE.targetLat;
  }

  function onPointerMove(event) {
    if (!STATE.isUserInteracting) return;
    STATE.lastInteractionTime = Date.now();

    const factor = 0.15;
    STATE.targetLon = (STATE.onPointerDownPointerX - event.clientX) * factor + STATE.onPointerDownLon;
    STATE.targetLat = (event.clientY - STATE.onPointerDownPointerY) * factor + STATE.onPointerDownLat;

    // Limitar inclinación vertical
    STATE.targetLat = Math.max(-85, Math.min(85, STATE.targetLat));
  }

  function onPointerUp(event) {
    if (event.isPrimary === false) return;
    STATE.isUserInteracting = false;
  }

  function onDocumentMouseWheel(event) {
    event.preventDefault();
    STATE.lastInteractionTime = Date.now();

    STATE.targetFov += event.deltaY * 0.05;
    STATE.targetFov = Math.max(40, Math.min(95, STATE.targetFov));
  }

  function onTouchStart(event) {
    if (event.touches.length === 2) {
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;
      STATE.touchDistanceStart = Math.sqrt(dx * dx + dy * dy);
    }
  }

  function onTouchMove(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = STATE.touchDistanceStart - dist;

      STATE.targetFov += diff * 0.1;
      STATE.targetFov = Math.max(40, Math.min(95, STATE.targetFov));
      STATE.touchDistanceStart = dist;
    }
  }

  function toggleAutoRotate() {
    STATE.autoRotate = !STATE.autoRotate;
    if (dom.btnAutoRotate) {
      dom.btnAutoRotate.classList.toggle('is-active', STATE.autoRotate);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  /**
   * Modo Giroscopio / Realidad Virtual Móvil
   */
  function toggleGyroscope() {
    if (STATE.isGyroActive) {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      STATE.isGyroActive = false;
      if (dom.btnGyro) dom.btnGyro.classList.remove('is-active');
      if (dom.gyroNotice) dom.gyroNotice.classList.remove('is-visible');
      return;
    }

    // Permiso en iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            activateGyro();
          } else {
            alert('Permiso de giroscopio denegado para el tour 360.');
          }
        })
        .catch(err => {
          console.error(err);
          activateGyro();
        });
    } else {
      activateGyro();
    }
  }

  function activateGyro() {
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    STATE.isGyroActive = true;
    STATE.autoRotate = false;
    if (dom.btnGyro) dom.btnGyro.classList.add('is-active');
    if (dom.btnAutoRotate) dom.btnAutoRotate.classList.remove('is-active');
    if (dom.gyroNotice) {
      dom.gyroNotice.classList.add('is-visible');
      setTimeout(() => {
        dom.gyroNotice.classList.remove('is-visible');
      }, 3500);
    }
  }

  function handleDeviceOrientation(event) {
    if (!STATE.isGyroActive) return;
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      STATE.targetLon = event.alpha;
      STATE.targetLat = Math.max(-85, Math.min(85, event.beta - 45));
    }
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /**
   * Bucle Principal de Animación
   */
  function animate() {
    requestAnimationFrame(animate);

    // Auto-rotación si el usuario está inactivo > 3s y el giroscopio está inactivo
    const idleTime = Date.now() - STATE.lastInteractionTime;
    if (STATE.autoRotate && !STATE.isUserInteracting && !STATE.isGyroActive && idleTime > 2500) {
      STATE.targetLon += 0.08;
    }

    // Interpolación suave (lerp) de ángulo y zoom
    const lerpSpeed = 0.08;
    STATE.lon += (STATE.targetLon - STATE.lon) * lerpSpeed;
    STATE.lat += (STATE.targetLat - STATE.lat) * lerpSpeed;
    STATE.fov += (STATE.targetFov - STATE.fov) * lerpSpeed;

    camera.fov = STATE.fov;
    camera.updateProjectionMatrix();

    // Actualizar orientación esférica de la cámara
    const phi = THREE.MathUtils.degToRad(90 - STATE.lat);
    const theta = THREE.MathUtils.degToRad(STATE.lon);

    const targetX = 500 * Math.sin(phi) * Math.cos(theta);
    const targetY = 500 * Math.cos(phi);
    const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(targetX, targetY, targetZ);

    // Renderizar WebGL
    renderer.render(scene, camera);

    // Actualizar Hotspots y Radar
    updateHotspotsProjection();
    updateRadarConeAngle();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Exponer API Global para inicialización desde el template
  window.TuEndpointTour360 = {
    init: init,
    switchScene: switchScene,
    openB2BModal: openB2BModal
  };
})();
