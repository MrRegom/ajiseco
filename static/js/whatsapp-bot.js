/**
 * EL AJÍ SECO DEL MAR — ASISTENTE CONCIERGE & WHATSAPP INTERACTIVO
 * Evita el botón mudo: interactúa, guía al usuario a la Carta, Menú Ejecutivo o Reservas.
 */

document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById('wa-concierge-trigger');
  const chatCard = document.getElementById('wa-concierge-card');
  const closeBtn = document.getElementById('wa-concierge-close');
  const options = document.querySelectorAll('.wa-bot-opt');

  if (!triggerBtn || !chatCard) return;

  const PHONE = "56958259443";

  // Alternar apertura
  triggerBtn.addEventListener('click', () => {
    chatCard.classList.toggle('is-open');
    if (chatCard.classList.contains('is-open')) {
      triggerBtn.classList.add('active');
    } else {
      triggerBtn.classList.remove('active');
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      chatCard.classList.remove('is-open');
      triggerBtn.classList.remove('active');
    });
  }

  // Manejo de opciones guiadas
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      const action = opt.getAttribute('data-action');
      const payload = opt.getAttribute('data-payload');
      const defaultMsg = opt.getAttribute('data-msg') || '¡Hola El Ají Seco del Mar!';

      chatCard.classList.remove('is-open');
      triggerBtn.classList.remove('active');

      if (action === 'scroll' && payload) {
        const target = document.querySelector(payload);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (action === 'link' && payload) {
        window.open(payload, '_blank', 'noopener,noreferrer');
      } else if (action === 'wa') {
        const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(defaultMsg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
});
