/**
 * EL AJÍ SECO DEL MAR — MOTOR 3D GASTRONÓMICO Y ESPACIAL INMERSIVO
 * Desarrollado con Three.js (ES Module), ACESFilmicToneMapping y UnrealBloom.
 * Sincronización cinemática guiada por Scroll y Parallax reactivo.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const stage = document.getElementById('stage-3d');
const story = document.getElementById('story-track');
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 860px)').matches;

export function init3DScene() {
  if (!stage || !story) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: true
    });
  } catch (err) {
    console.warn('WebGL no disponible:', err);
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Cielo de atardecer costero en Viña del Mar (Gradiente atardecer pacífico)
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 8;
  skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext('2d');
  const gradient = skyCtx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0.0, '#040711'); // Noche marina superior
  gradient.addColorStop(0.4, '#091326'); // Índigo profundo
  gradient.addColorStop(0.7, '#1b2a47'); // Azul pacífico crepúsculo
  gradient.addColorStop(0.88, '#59323f'); // Magenta costero
  gradient.addColorStop(0.96, '#a85b3b'); // Ocre atardecer
  gradient.addColorStop(1.0, '#d4884f'); // Resplandor horizonte
  skyCtx.fillStyle = gradient;
  skyCtx.fillRect(0, 0, 8, 512);

  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = skyTexture;
  scene.fog = new THREE.FogExp2(0x0a1120, 0.022);

  const camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 280);

  // ---------------- LUCES AMBIENTALES Y CÁLIDAS ----------------
  const hemiLight = new THREE.HemisphereLight(0x6080b0, 0x1f140e, 0.7);
  scene.add(hemiLight);

  // Luz dorada lateral simulando sol poniente en la bahía de Viña
  const sunsetLight = new THREE.DirectionalLight(0xffb870, 2.2);
  sunsetLight.position.set(-18, 14, 12);
  sunsetLight.castShadow = true;
  sunsetLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sunsetLight.shadow.bias = -0.0003;
  sunsetLight.shadow.normalBias = 0.03;
  scene.add(sunsetLight);

  // Lámparas cálidas colgantes y velas de mesa
  const warmLight = (x, y, z, intensity = 28, distance = 14, color = 0xffa952) => {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };

  const lampL1 = warmLight(-4.5, 3.8, 2.0, 32);
  const lampL2 = warmLight(3.5, 3.8, 2.0, 32);
  const cevicheBarLight = warmLight(0, 2.6, -1.5, 24, 10, 0x88d5ff); // Luz fresca en cebichería
  const fireWokLight = warmLight(-5.2, 2.2, -6.5, 45, 12, 0xff4d26); // Resplandor rojizo del Wok
  const piscoBarLight = warmLight(6.2, 2.8, -4.5, 36, 12, 0xffc44d); // Resplandor dorado de cócteles

  // ---------------- TEXTURAS PROCEDURALES OPTIMIZADAS ----------------
  const createProceduralTexture = (size, draw) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    draw(g, size);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  // Madera noble de cubierta marina (Deck de terraza)
  const woodTexture = createProceduralTexture(512, (g, s) => {
    g.fillStyle = '#1c1510';
    g.fillRect(0, 0, s, s);
    const planks = 12;
    const ph = s / planks;
    for (let i = 0; i < planks; i++) {
      g.fillStyle = i % 2 === 0 ? '#261c16' : '#221913';
      g.fillRect(0, i * ph, s, ph - 2);
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.fillRect(0, (i + 1) * ph - 2, s, 2);
    }
  });
  woodTexture.repeat.set(8, 8);

  // Mármol pulido para la barra cebichera
  const marbleTexture = createProceduralTexture(512, (g, s) => {
    g.fillStyle = '#0f1724';
    g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(212, 175, 55, 0.22)';
    g.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      g.beginPath();
      g.moveTo(Math.random() * s, 0);
      g.bezierCurveTo(Math.random() * s, s * 0.3, Math.random() * s, s * 0.7, Math.random() * s, s);
      g.stroke();
    }
  });

  // Materiales PBR
  const matDeck = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.7,
    metalness: 0.08
  });

  const matMarble = new THREE.MeshStandardMaterial({
    map: marbleTexture,
    roughness: 0.18,
    metalness: 0.15
  });

  const matGoldBrass = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.88
  });

  const matDarkSteel = new THREE.MeshStandardMaterial({
    color: 0x181e29,
    roughness: 0.5,
    metalness: 0.7
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5
  });

  const matGlowAmber = new THREE.MeshBasicMaterial({
    color: new THREE.Color(4.0, 2.8, 1.2)
  });

  const matGlowFlame = new THREE.MeshBasicMaterial({
    color: new THREE.Color(4.5, 1.2, 0.4)
  });

  // ---------------- MODELADO ESPACIAL DEL RESTAURANTE ----------------
  const restaurantGroup = new THREE.Group();
  scene.add(restaurantGroup);

  // 1. Deck Principal de la Terraza frente al Mar
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floor = new THREE.Mesh(floorGeo, matDeck);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  restaurantGroup.add(floor);

  // 2. Baranda de Cristal y Cobre con vista a la Bahía
  const balustradeGeo = new THREE.BoxGeometry(36, 1.1, 0.15);
  const balustrade = new THREE.Mesh(balustradeGeo, matGlass);
  balustrade.position.set(0, 0.55, 12);
  balustrade.castShadow = true;
  restaurantGroup.add(balustrade);

  const topRailGeo = new THREE.BoxGeometry(36.2, 0.12, 0.3);
  const topRail = new THREE.Mesh(topRailGeo, matGoldBrass);
  topRail.position.set(0, 1.15, 12);
  restaurantGroup.add(topRail);

  // 3. Estación 1: Barra Cebichera Central con pedestal
  const cevicheBar = new THREE.Group();
  cevicheBar.position.set(0, 0, 0);
  restaurantGroup.add(cevicheBar);

  const barBaseGeo = new THREE.CylinderGeometry(3.8, 4.1, 1.2, 32);
  const barBase = new THREE.Mesh(barBaseGeo, matMarble);
  barBase.position.y = 0.6;
  barBase.receiveShadow = true;
  barBase.castShadow = true;
  cevicheBar.add(barBase);

  // Plato cebichero emblemático flotante sobre pedestal de hielo
  const dishPlateGeo = new THREE.CylinderGeometry(1.2, 0.9, 0.16, 28);
  const dishPlate = new THREE.Mesh(dishPlateGeo, matDarkSteel);
  dishPlate.position.set(0, 1.35, 0);
  dishPlate.castShadow = true;
  cevicheBar.add(dishPlate);

  const cevicheCenterGeo = new THREE.CylinderGeometry(0.85, 0.8, 0.12, 24);
  const cevicheCenter = new THREE.Mesh(cevicheCenterGeo, new THREE.MeshStandardMaterial({
    color: 0xf5f3ea,
    roughness: 0.4
  }));
  cevicheCenter.position.set(0, 1.45, 0);
  cevicheBar.add(cevicheCenter);

  // Acentos de ají limo y rocoto
  for (let i = 0; i < 5; i++) {
    const chiliGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
    const chili = new THREE.Mesh(chiliGeo, new THREE.MeshStandardMaterial({
      color: 0xef233c,
      roughness: 0.3
    }));
    const ang = (i / 5) * Math.PI * 2;
    chili.position.set(Math.cos(ang) * 0.55, 1.55, Math.sin(ang) * 0.55);
    chili.rotation.z = 0.4;
    cevicheBar.add(chili);
  }

  // 4. Estación 2: Wok Criollo y Brasas (Lado Izquierdo)
  const wokStation = new THREE.Group();
  wokStation.position.set(-8.5, 0, -5.5);
  restaurantGroup.add(wokStation);

  const wokCounter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 2.5), matDarkSteel);
  wokCounter.position.y = 0.55;
  wokStation.add(wokCounter);

  const wokPan = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), matDarkSteel);
  wokPan.position.set(0, 1.15, 0);
  wokPan.rotation.x = Math.PI;
  wokStation.add(wokPan);

  // Núcleo de llama del wok
  const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 12), matGlowFlame);
  flameMesh.position.set(0, 1.3, 0);
  wokStation.add(flameMesh);

  // 5. Estación 3: Barra de Coctelería & Cava (Lado Derecho)
  const piscoBar = new THREE.Group();
  piscoBar.position.set(8.5, 0, -4.5);
  restaurantGroup.add(piscoBar);

  const piscoCounter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.15, 2.2), matMarble);
  piscoCounter.position.y = 0.58;
  piscoStationAdd(piscoBar, piscoCounter);

  function piscoStationAdd(group, counter) {
    group.add(counter);
    // Copa de Pisco Sour Catedral
    const glassStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), matGlass);
    glassStem.position.set(0, 1.4, 0);
    group.add(glassStem);

    const glassCup = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.12, 0.65, 20), matGlass);
    glassCup.position.set(0, 1.8, 0);
    group.add(glassCup);

    const sourFoam = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.22, 18), new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9
    }));
    sourFoam.position.set(0, 1.95, 0);
    group.add(sourFoam);
  }

  // 6. Lámparas colgantes coloniales / contemporáneas de cobre
  const lampsGroup = new THREE.Group();
  scene.add(lampsGroup);

  const createHangingLamp = (x, y, z) => {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.5, 8), matDarkSteel);
    cord.position.y = 1.25;
    lamp.add(cord);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 24, 1, true), matGoldBrass);
    lamp.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matGlowAmber);
    bulb.position.y = -0.12;
    lamp.add(bulb);

    lampsGroup.add(lamp);
    return lamp;
  };

  createHangingLamp(-4.5, 3.8, 2.0);
  createHangingLamp(3.5, 3.8, 2.0);
  createHangingLamp(0, 4.2, -1.0);

  // 7. Sistema de Partículas: Bruma Marina y Destellos Gastronómicos
  const particleCount = isMobile ? 300 : 700;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 35;
    particlePos[i * 3 + 1] = Math.random() * 8 + 0.2;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 35;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xf5cf53,
    size: 0.09,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // ---------------- POST-PROCESAMIENTO UNREAL BLOOM ----------------
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(pixelRatio);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.45 : 0.65, // Intensidad de brillo
    0.4,                    // Radio
    0.82                    // Umbral
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // ---------------- CINEMÁTICA Y RECORRIDO DE CÁMARA ----------------
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const cameraStations = [
    // 0: Vista Panorámica Bienvenida - Terraza y Bahía de Viña
    { pos: V(0, 4.2, 14.5), target: V(0, 1.2, 0) },
    // 1: Estación Cebichera de Autor - Acercamiento a la frescura marina
    { pos: V(0.2, 2.4, 3.2), target: V(0, 1.3, 0) },
    // 2: Estación Fuego & Wok Criollo - Ángulo dinámico hacia las llamas
    { pos: V(-5.8, 2.6, -2.8), target: V(-8.5, 1.2, -5.5) },
    // 3: Cava Marina & Coctelería Pisco Sour - Enfoque a mixología
    { pos: V(5.6, 2.8, -1.8), target: V(8.5, 1.4, -4.5) },
    // 4: Mesa Imperial & Reservas - Perspectiva de sala y mesa de honor
    { pos: V(1.5, 3.2, 8.5), target: V(0, 1.0, 2.0) }
  ];

  const totalStations = cameraStations.length - 1;
  let scrollProgress = 0;
  let targetProgress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isRunning = true;

  const currentCamPos = new THREE.Vector3().copy(cameraStations[0].pos);
  const currentTargetPos = new THREE.Vector3().copy(cameraStations[0].target);

  function calculateScroll() {
    const rect = story.getBoundingClientRect();
    const scrollHeight = rect.height - window.innerHeight;
    if (scrollHeight <= 0) return;
    const currentScroll = -rect.top;
    const normalized = Math.max(0, Math.min(1, currentScroll / scrollHeight));
    targetProgress = normalized * totalStations;
  }

  window.addEventListener('scroll', calculateScroll, { passive: true });
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 1.0;
  }, { passive: true });

  function handleResize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 54 : w / h < 1.2 ? 46 : 40;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(handleResize).observe(stage);
  handleResize();
  calculateScroll();
  scrollProgress = targetProgress;

  new IntersectionObserver(([entry]) => {
    isRunning = entry.isIntersecting;
  }, { rootMargin: '20% 0px' }).observe(story);

  // ---------------- BUCLE DE RENDERIZADO ----------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isRunning || document.hidden) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Interpolación suave del scroll (lerp)
    scrollProgress += (targetProgress - scrollProgress) * 0.085;

    const currentIndex = Math.floor(scrollProgress);
    const nextIndex = Math.min(totalStations, currentIndex + 1);
    const stepAlpha = scrollProgress - currentIndex;

    const pA = cameraStations[currentIndex].pos;
    const pB = cameraStations[nextIndex].pos;
    const tA = cameraStations[currentIndex].target;
    const tB = cameraStations[nextIndex].target;

    // Posición interpolada + Parallax reactivo al cursor
    currentCamPos.lerpVectors(pA, pB, stepAlpha);
    currentTargetPos.lerpVectors(tA, tB, stepAlpha);

    camera.position.x = currentCamPos.x + (isReducedMotion ? 0 : mouseX * 0.6);
    camera.position.y = currentCamPos.y - (isReducedMotion ? 0 : mouseY * 0.4);
    camera.position.z = currentCamPos.z;

    camera.lookAt(currentTargetPos.x, currentTargetPos.y, currentTargetPos.z);

    // Animación de sutil rotación del plato cebichero central
    if (dishPlate) {
      dishPlate.rotation.y = elapsedTime * 0.12;
      cevicheCenter.rotation.y = elapsedTime * 0.12;
    }

    // Parpadeo sutil de la llama viva en el wok
    if (flameMesh) {
      flameMesh.scale.y = 1.0 + Math.sin(elapsedTime * 14) * 0.18;
      fireWokLight.intensity = 42 + Math.sin(elapsedTime * 18) * 12;
    }

    // Movimiento orgánico de las partículas / bruma marina
    const positions = particleGeo.attributes.position.array;
    for (let i = 1; i < particleCount * 3; i += 3) {
      positions[i] += delta * 0.18;
      if (positions[i] > 8.0) positions[i] = 0.2;
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
  }

  animate();
}

// Inicialización controlada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3DScene);
} else {
  init3DScene();
}
