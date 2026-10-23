/**
 * EL AJÍ SECO DEL MAR — WIDGET DE RESERVAS CORPORATIVO
 * Validación en tiempo real y consumo de API con retroalimentación inmediata.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('booking-feedback');
  const submitBtn = document.getElementById('btn-submit-booking');
  const dateInput = document.getElementById('res-fecha');
  const timeInput = document.getElementById('res-hora');

  if (!form) return;

  // Restricción de fecha mínima (hoy)
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  function showFeedback(type, message, waUrl = null) {
    if (!feedback) return;
    feedback.className = `booking-feedback ${type}`;
    feedback.style.background = type === 'success' ? 'rgba(229, 169, 59, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    feedback.style.border = type === 'success' ? '1px solid var(--color-teja)' : '1px solid #ef4444';
    feedback.style.color = 'var(--color-crema)';
    feedback.style.display = 'block';

    if (type === 'success') {
      feedback.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.35rem; color: var(--color-teja);">✓ ¡Solicitud Registrada con Éxito!</div>
        <p style="margin-bottom: 0.85rem; color: var(--color-crema-muted);">${message}</p>
        ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Abrir confirmación en WhatsApp</a>` : ''}
      `;
    } else {
      feedback.innerHTML = `<div style="font-weight: 600; color: #ef4444;">⚠ Error al reservar</div><p style="color: var(--color-crema-muted);">${message}</p>`;
    }
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (feedback) feedback.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando disponibilidad...';
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]')?.value;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch('/api/reservar/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const d = result.data;
        const msg = `Reserva #${d.codigo_reserva} a nombre de <b>${d.nombre_cliente}</b> para el <b>${d.fecha}</b> a las <b>${d.hora} hrs</b> (${d.comensales} personas en ${d.zona_nombre}).`;
        showFeedback('success', msg, d.whatsapp_url);
        form.reset();
        if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
      } else {
        showFeedback('error', result.message || 'No fue posible completar la reserva.');
      }
    } catch (err) {
      // Fallback offline / static hosting: genera WhatsApp directo si la API no responde
      console.warn('API no disponible, generando derivación WhatsApp directa:', err);
      const nombre = payload.nombre_cliente || 'Cliente';
      const fecha = payload.fecha || '';
      const hora = payload.hora || '';
      const personas = payload.comensales || '2';
      const zona = payload.zona_slug || 'Terraza San Martín';
      const notas = payload.notas_especiales || 'Ninguno';

      const waText = encodeURIComponent(
        `¡Hola El Ají Seco del Mar Viña del Mar!\n` +
        `Quisiera reservar una mesa:\n` +
        `👤 Nombre: ${nombre}\n` +
        `📅 Fecha: ${fecha}\n` +
        `⏰ Hora: ${hora} hrs\n` +
        `👥 Comensales: ${personas}\n` +
        `📍 Zona: ${zona}\n` +
        `📝 Notas: ${notas}`
      );
      const fallbackUrl = `https://wa.me/56958259443?text=${waText}`;

      showFeedback(
        'success',
        'Hemos preparado su confirmación directa para el equipo de anfitriones en Viña del Mar.',
        fallbackUrl
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar y Solicitar Reserva';
      }
    }
  });
});
