/**
 * Script de Inicialización Desacoplado para Tour 360.
 * Cumplimiento estricto: Cero código JavaScript incrustado en plantillas HTML.
 */

document.addEventListener('DOMContentLoaded', function () {
  const manifestElement = document.getElementById('tour360-manifest');
  if (!manifestElement) {
    console.warn('[Tour360] No se encontró el elemento con el manifiesto (#tour360-manifest).');
    return;
  }

  try {
    const manifestData = JSON.parse(manifestElement.textContent);
    if (window.TuEndpointTour360 && typeof window.TuEndpointTour360.init === 'function') {
      window.TuEndpointTour360.init(manifestData);
    } else {
      console.error('[Tour360] Motor TuEndpointTour360 no disponible.');
    }
  } catch (error) {
    console.error('[Tour360] Error parseando datos del manifiesto:', error);
  }
});
