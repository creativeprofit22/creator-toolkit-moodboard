/**
 * Dropdown Interactive Script
 * Features: Click toggle, outside click close, keyboard navigation, searchable filtering
 */
(function() {
  const dropdowns = document.querySelectorAll('.dropdown:not(.dropdown-hover)');
  let activeDropdown = null;

  // Toggle dropdown open/close
  function toggleDropdown(dropdown, forceClose = false) {
    const isOpen = dropdown.classList.contains('open');

    // Close all dropdowns first
    closeAllDropdowns();

    // Open this one if it wasn't already open (and not forcing close)
    if (!isOpen && !forceClose) {
      dropdown.classList.add('open');
      activeDropdown = dropdown;

      // Focus first item for keyboard nav
      const firstItem = dropdown.querySelector('.dropdown-item:not(.disabled)');
      if (firstItem) firstItem.focus();

      // Reset search if searchable
      const searchInput = dropdown.querySelector('[data-search-input]');
      if (searchInput) {
        searchInput.value = '';
        filterItems(dropdown, '');
        searchInput.focus();
      }
    }
  }

  function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove('open'));
    activeDropdown = null;
  }

  // Filter items in searchable dropdown
  function filterItems(dropdown, query) {
    const optionsContainer = dropdown.querySelector('[data-options]');
    if (!optionsContainer) return;

    const items = optionsContainer.querySelectorAll('.dropdown-item');
    const normalizedQuery = query.toLowerCase().trim();
    let visibleCount = 0;

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matches = normalizedQuery === '' || text.includes(normalizedQuery);
      item.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    // Show/hide no results message
    let noResults = dropdown.querySelector('.dropdown-no-results');
    if (visibleCount === 0 && normalizedQuery !== '') {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'dropdown-no-results';
        noResults.textContent = 'No results found';
        optionsContainer.appendChild(noResults);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }

  // Select item
  function selectItem(dropdown, item) {
    if (item.classList.contains('disabled')) return;

    // Remove selected from siblings
    const menu = item.closest('.dropdown-menu') || item.closest('[data-options]');
    if (menu) {
      menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
    }

    // Add selected to clicked item
    item.classList.add('selected');

    // Update trigger text for searchable dropdowns
    if (dropdown.classList.contains('dropdown-searchable')) {
      const trigger = dropdown.querySelector('.dropdown-trigger');
      const triggerText = trigger.querySelector('.dropdown-trigger-text') || trigger;
      triggerText.textContent = item.textContent.trim();
    }

    // Close dropdown (unless it's a submenu)
    if (!item.closest('.dropdown-submenu')) {
      closeAllDropdowns();
    }

    // Dispatch custom event
    dropdown.dispatchEvent(new CustomEvent('dropdown:select', {
      detail: { item, value: item.dataset.value || item.textContent.trim() }
    }));
  }

  // Keyboard navigation
  function handleKeyNav(dropdown, e) {
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!menu) return;

    const items = Array.from(menu.querySelectorAll('.dropdown-item:not(.disabled):not([style*="display: none"])'));
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].focus();
        break;

      case 'Enter':
        e.preventDefault();
        if (document.activeElement.classList.contains('dropdown-item')) {
          selectItem(dropdown, document.activeElement);
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeAllDropdowns();
        dropdown.querySelector('.dropdown-trigger').focus();
        break;
    }
  }

  // Initialize each dropdown
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (!trigger || !menu) return;

    // Click trigger to toggle
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dropdown);
    });

    // Click item to select
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        e.stopPropagation();
        selectItem(dropdown, item);
      }
    });

    // Keyboard navigation
    dropdown.addEventListener('keydown', (e) => {
      if (dropdown.classList.contains('open')) {
        handleKeyNav(dropdown, e);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown(dropdown);
      }
    });

    // Searchable dropdown input
    const searchInput = dropdown.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterItems(dropdown, e.target.value);
      });

      // Prevent closing when clicking search input
      searchInput.addEventListener('click', (e) => e.stopPropagation());
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (activeDropdown && !activeDropdown.contains(e.target)) {
      closeAllDropdowns();
    }
  });

  // Close on Escape (global)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeDropdown) {
      closeAllDropdowns();
    }
  });
})();
