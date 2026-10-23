/**
 * EL AJÍ SECO DEL MAR — CONTROLADOR DE CARTA INTERACTIVA
 * Manejo modular de filtros por categoría y búsqueda en tiempo real sin scripts en el template.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = document.querySelectorAll('.dish-card');
  const searchInput = document.getElementById('menu-search-input');
  const dishesGrid = document.getElementById('dishes-grid');

  if (!tabs.length || !cards.length) return;

  let currentCategory = 'todos';
  let currentSearchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardName = (card.querySelector('.dish-card__title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.dish-card__desc')?.textContent || '').toLowerCase();

      const matchesCategory = (currentCategory === 'todos' || cardCategory === currentCategory);
      const matchesSearch = !currentSearchQuery ||
                            cardName.includes(currentSearchQuery) ||
                            cardDesc.includes(currentSearchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });

    // Mensaje de estado vacío accesible
    let emptyNotice = document.getElementById('menu-empty-notice');
    if (visibleCount === 0) {
      if (!emptyNotice && dishesGrid) {
        emptyNotice = document.createElement('div');
        emptyNotice.id = 'menu-empty-notice';
        emptyNotice.className = 'menu-empty-notice';
        emptyNotice.style.gridColumn = '1 / -1';
        emptyNotice.style.textAlign = 'center';
        emptyNotice.style.padding = '3rem 1rem';
        emptyNotice.style.color = 'var(--color-text-muted)';
        emptyNotice.innerHTML = `
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No se encontraron preparaciones que coincidan con su búsqueda.</p>
          <button class="btn btn--ghost btn--sm" id="btn-reset-filters">Restablecer filtros</button>
        `;
        dishesGrid.appendChild(emptyNotice);

        document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          currentSearchQuery = '';
          currentCategory = 'todos';
          tabs.forEach(t => t.classList.remove('active'));
          tabs[0]?.classList.add('active');
          applyFilters();
        });
      }
    } else if (emptyNotice) {
      emptyNotice.remove();
    }
  }

  // Event Listeners para Pestañas de Categoría
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-slug') || 'todos';
      applyFilters();
    });
  });

  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
});
