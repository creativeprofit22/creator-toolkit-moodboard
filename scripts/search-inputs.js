/**
 * Search & Input Fields Interactive Script (Section 25)
 * Features: Autocomplete, clearable inputs, password toggle, validation, keyboard navigation
 */
(function() {
  // ==========================================
  // DEBOUNCE UTILITY
  // ==========================================
  function debounce(fn, delay) {
    let timeoutId = null;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ==========================================
  // AUTOCOMPLETE SEARCH
  // ==========================================
  const autocompleteContainers = document.querySelectorAll('.search-autocomplete');

  autocompleteContainers.forEach(container => {
    const input = container.querySelector('[data-autocomplete-input]');
    const dropdown = container.querySelector('.autocomplete-dropdown');
    const items = container.querySelectorAll('.autocomplete-item[role="option"]');
    const noResults = container.querySelector('.autocomplete-no-results');

    if (!input || !dropdown || items.length === 0) return;

    let activeIndex = -1;
    const allItems = Array.from(items);
    let visibleItems = allItems;

    // Highlight matching text in item
    function highlightMatch(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Filter and display items
    function filterItems(query) {
      const normalizedQuery = query.toLowerCase().trim();
      visibleItems = [];
      activeIndex = -1;

      allItems.forEach(item => {
        const value = item.dataset.value || '';
        const textSpan = item.querySelector('.item-text');
        const originalText = value;

        if (!normalizedQuery || originalText.toLowerCase().includes(normalizedQuery)) {
          item.style.display = '';
          if (textSpan) {
            textSpan.innerHTML = highlightMatch(originalText, normalizedQuery);
          }
          visibleItems.push(item);
        } else {
          item.style.display = 'none';
        }
        item.classList.remove('active');
      });

      // Show/hide no results
      if (noResults) {
        noResults.style.display = visibleItems.length === 0 && normalizedQuery ? '' : 'none';
      }

      // Activate first item if there are results
      if (visibleItems.length > 0 && normalizedQuery) {
        activeIndex = 0;
        visibleItems[0].classList.add('active');
        updateAriaActiveDescendant();
      }
    }

    // Update ARIA active descendant
    function updateAriaActiveDescendant() {
      if (activeIndex >= 0 && visibleItems[activeIndex]) {
        const activeItem = visibleItems[activeIndex];
        const itemId = activeItem.id || `autocomplete-item-${activeIndex}`;
        activeItem.id = itemId;
        input.setAttribute('aria-activedescendant', itemId);
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    // Open dropdown
    function openDropdown() {
      container.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      filterItems(input.value);
    }

    // Close dropdown
    function closeDropdown() {
      container.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      allItems.forEach(item => item.classList.remove('active'));
      input.removeAttribute('aria-activedescendant');
    }

    // Select item
    function selectItem(item) {
      const value = item.dataset.value || item.textContent.trim();
      input.value = value;
      closeDropdown();

      // Dispatch custom event
      container.dispatchEvent(new CustomEvent('autocomplete:select', {
        detail: { value, item }
      }));
    }

    // Navigate with keyboard
    function navigate(direction) {
      if (visibleItems.length === 0) return;

      // Remove active from current
      if (activeIndex >= 0 && visibleItems[activeIndex]) {
        visibleItems[activeIndex].classList.remove('active');
      }

      // Calculate new index
      if (direction === 'down') {
        activeIndex = activeIndex < visibleItems.length - 1 ? activeIndex + 1 : 0;
      } else {
        activeIndex = activeIndex > 0 ? activeIndex - 1 : visibleItems.length - 1;
      }

      // Add active to new
      const activeItem = visibleItems[activeIndex];
      activeItem.classList.add('active');
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      updateAriaActiveDescendant();
    }

    // Event: Input with debounce
    const debouncedFilter = debounce((query) => {
      filterItems(query);
    }, 150);

    input.addEventListener('input', (e) => {
      if (!container.classList.contains('open')) {
        openDropdown();
      }
      debouncedFilter(e.target.value);
    });

    // Event: Focus
    input.addEventListener('focus', () => {
      openDropdown();
    });

    // Event: Keyboard navigation
    input.addEventListener('keydown', (e) => {
      const isOpen = container.classList.contains('open');

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          } else {
            navigate('down');
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            navigate('up');
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (isOpen && activeIndex >= 0 && visibleItems[activeIndex]) {
            selectItem(visibleItems[activeIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;

        case 'Tab':
          closeDropdown();
          break;
      }
    });

    // Event: Click on item
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.autocomplete-item[role="option"]');
      if (item) {
        e.preventDefault();
        selectItem(item);
      }
    });

    // Event: Click outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        closeDropdown();
      }
    });
  });

  // ==========================================
  // CLEARABLE INPUT
  // ==========================================
  const clearableContainers = document.querySelectorAll('.clearable-input');

  clearableContainers.forEach(container => {
    const input = container.querySelector('[data-clearable-input]');
    const clearBtn = container.querySelector('[data-clear-btn]');

    if (!input || !clearBtn) return;

    // Update has-value class
    function updateHasValue() {
      if (input.value.length > 0) {
        container.classList.add('has-value');
      } else {
        container.classList.remove('has-value');
      }
    }

    // Event: Input change
    input.addEventListener('input', updateHasValue);

    // Event: Clear button click
    clearBtn.addEventListener('click', () => {
      input.value = '';
      container.classList.remove('has-value');
      input.focus();

      // Dispatch input event for any listeners
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Initialize
    updateHasValue();
  });

  // ==========================================
  // PASSWORD INPUT WITH TOGGLE
  // ==========================================
  const passwordContainers = document.querySelectorAll('.password-input');

  passwordContainers.forEach(container => {
    const input = container.querySelector('[data-password-input]');
    const toggleBtn = container.querySelector('[data-toggle-visibility]');
    const showIcon = toggleBtn?.querySelector('.icon-show');
    const hideIcon = toggleBtn?.querySelector('.icon-hide');
    const strengthLabel = container.querySelector('[data-strength-label]');

    if (!input || !toggleBtn) return;

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      // Toggle icons
      if (showIcon && hideIcon) {
        showIcon.style.display = isPassword ? 'none' : '';
        hideIcon.style.display = isPassword ? '' : 'none';
      }

      // Update aria-label
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      // Maintain focus
      input.focus();
    });

    // Password strength calculation
    function calculateStrength(password) {
      if (!password) return { strength: '', label: '' };

      let score = 0;

      // Length checks
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;

      // Character variety
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^a-zA-Z0-9]/.test(password)) score++;

      // Determine strength level
      if (score <= 2) return { strength: 'weak', label: 'Weak' };
      if (score <= 4) return { strength: 'medium', label: 'Medium' };
      if (score <= 5) return { strength: 'strong', label: 'Strong' };
      return { strength: 'very-strong', label: 'Very Strong' };
    }

    // Event: Update strength on input
    input.addEventListener('input', () => {
      const { strength, label } = calculateStrength(input.value);
      container.setAttribute('data-strength', strength);
      if (strengthLabel) {
        strengthLabel.textContent = label;
      }
    });
  });

  // ==========================================
  // INPUT VALIDATION (Live Demo)
  // ==========================================
  const validationDemo = document.getElementById('validation-default');

  if (validationDemo) {
    const input = validationDemo.querySelector('input');
    const helperText = validationDemo.querySelector('.helper-text');

    if (input && helperText) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Debounced validation
      const debouncedValidate = debounce((value) => {
        // Remove existing states
        validationDemo.classList.remove('input-error', 'input-success');

        if (!value) {
          helperText.textContent = 'Enter your email address';
          input.removeAttribute('aria-invalid');
          return;
        }

        if (emailRegex.test(value)) {
          validationDemo.classList.add('input-success');
          helperText.textContent = 'Email looks good!';
          input.setAttribute('aria-invalid', 'false');
        } else {
          validationDemo.classList.add('input-error');
          helperText.textContent = 'Please enter a valid email';
          input.setAttribute('aria-invalid', 'true');

          // Announce to screen readers
          announceToScreenReader('Error: Please enter a valid email');
        }
      }, 300);

      input.addEventListener('input', (e) => {
        debouncedValidate(e.target.value);
      });
    }
  }

  // Screen reader announcement utility
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // ==========================================
  // INPUT GROUP BUTTON INTERACTIONS
  // ==========================================
  const inputGroupButtons = document.querySelectorAll('.input-suffix-btn');

  inputGroupButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const inputField = e.target.closest('.input-field');
      const input = inputField?.querySelector('input');

      if (input && input.value) {
        // Example: Log the action (in real app, would submit form or perform action)
        console.log('Input group action:', input.value);

        // Visual feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);

        // Dispatch custom event
        inputField.dispatchEvent(new CustomEvent('inputgroup:submit', {
          detail: { value: input.value },
          bubbles: true
        }));
      }
    });
  });

  // ==========================================
  // FOCUS MANAGEMENT FOR ALL INPUTS
  // ==========================================
  const allInputFields = document.querySelectorAll('.section-25-search-inputs .input-field input');

  allInputFields.forEach(input => {
    // Add focus ring animation
    input.addEventListener('focus', () => {
      const inputField = input.closest('.input-field');
      if (inputField) {
        inputField.classList.add('is-focused');
      }
    });

    input.addEventListener('blur', () => {
      const inputField = input.closest('.input-field');
      if (inputField) {
        inputField.classList.remove('is-focused');
      }
    });
  });

  // ==========================================
  // TEXT ANIMATION / VANISH EFFECTS
  // Particle effects on Enter and Backspace
  // ==========================================
  const vanishInputs = document.querySelectorAll('[data-vanish-input]');

  vanishInputs.forEach(container => {
    const wrapper = container.querySelector('.input-vanish-wrapper');
    const ghostContainer = container.querySelector('.input-ghost-container');
    const input = wrapper?.querySelector('input');

    if (!wrapper || !ghostContainer || !input) return;

    let previousValue = input.value || '';

    // Get character position for ghost placement
    function getCharPosition(charIndex) {
      const span = document.createElement('span');
      span.style.cssText = 'position:absolute;visibility:hidden;font:inherit;white-space:pre;';
      span.textContent = input.value.substring(0, charIndex);
      wrapper.appendChild(span);
      const width = span.offsetWidth;
      span.remove();
      return width;
    }

    // Spawn deletion ghost with particles (single character delete)
    function spawnDeletionGhost(char, xPos) {
      if (!char || char === ' ') return;

      // Character ghost (floats up)
      const ghost = document.createElement('span');
      ghost.className = 'char-ghost';
      ghost.textContent = char;
      ghost.style.left = xPos + 'px';
      ghost.style.top = '50%';
      ghost.style.transform = 'translateY(-50%)';
      ghostContainer.appendChild(ghost);
      setTimeout(() => ghost.remove(), 350);

      // Spawn 2-3 particles flowing left
      const particleCount = 2 + Math.floor(Math.random() * 2);
      for (let p = 0; p < particleCount; p++) {
        const particle = document.createElement('span');
        particle.className = 'vanish-particle';
        particle.style.left = (xPos + 4) + 'px';
        particle.style.top = '50%';

        const flowX = -30 - Math.random() * 35;
        const flowYEnd = (Math.random() - 0.5) * 18;

        particle.style.setProperty('--particle-size', (2 + Math.random() * 2) + 'px');
        particle.style.setProperty('--flow-x', flowX + 'px');
        particle.style.setProperty('--flow-y-start', '0px');
        particle.style.setProperty('--flow-y-end', flowYEnd + 'px');
        particle.style.setProperty('--particle-duration', (550 + Math.random() * 200) + 'ms');
        particle.style.setProperty('--particle-delay', (p * 50) + 'ms');

        ghostContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 850);
      }
    }

    // Vanish effect on submit (particle flow right-to-left)
    function triggerVanishEffect(text) {
      if (!text) return;

      const chars = text.split('');
      const totalChars = chars.filter(c => c !== ' ').length;
      let nonSpaceIndex = 0;

      // Process characters right-to-left (reverse index for delay)
      chars.forEach((char, i) => {
        if (char === ' ') return;

        const xPos = getCharPosition(i);
        const reverseIndex = totalChars - 1 - nonSpaceIndex;
        nonSpaceIndex++;

        // Fade the character
        const charEl = document.createElement('span');
        charEl.className = 'char-vanish';
        charEl.textContent = char;
        charEl.style.left = xPos + 'px';
        charEl.style.top = '50%';
        charEl.style.setProperty('--fade-delay', (reverseIndex * 40) + 'ms');
        charEl.style.setProperty('--fade-duration', '180ms');
        ghostContainer.appendChild(charEl);

        // Spawn 3-5 particles per character
        const particleCount = 3 + Math.floor(Math.random() * 3);
        for (let p = 0; p < particleCount; p++) {
          const particle = document.createElement('span');
          particle.className = 'vanish-particle';
          particle.style.left = (xPos + 4) + 'px';
          particle.style.top = '50%';

          // Flow direction: always left, with slight vertical variance
          const flowX = -50 - Math.random() * 60;
          const flowYStart = (Math.random() - 0.5) * 8;
          const flowYEnd = (Math.random() - 0.5) * 20;

          const size = 2 + Math.random() * 3;
          const duration = 800 + Math.random() * 300;
          const delay = (reverseIndex * 40) + (p * 35);

          particle.style.setProperty('--particle-size', size + 'px');
          particle.style.setProperty('--flow-x', flowX + 'px');
          particle.style.setProperty('--flow-y-start', flowYStart + 'px');
          particle.style.setProperty('--flow-y-end', flowYEnd + 'px');
          particle.style.setProperty('--particle-duration', duration + 'ms');
          particle.style.setProperty('--particle-delay', delay + 'ms');

          ghostContainer.appendChild(particle);
        }
      });

      // Clear all elements after animation completes
      setTimeout(() => {
        ghostContainer.querySelectorAll('.char-vanish, .vanish-particle').forEach(el => el.remove());
      }, 1800);
    }

    // Track input for deletion detection
    input.addEventListener('input', (e) => {
      const current = e.target.value;
      const prev = previousValue;

      // Check if single character was deleted
      if (prev.length - current.length === 1) {
        let deleteIndex = current.length;
        for (let i = 0; i < current.length; i++) {
          if (current[i] !== prev[i]) {
            deleteIndex = i;
            break;
          }
        }

        const deletedChar = prev[deleteIndex];
        const xPos = getCharPosition(deleteIndex);
        spawnDeletionGhost(deletedChar, xPos);
      }

      previousValue = current;
    });

    // Handle Enter key for vanish effect
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const text = input.value.trim();

        // Skip if autocomplete is open and has active selection
        const autocomplete = container.closest('.search-autocomplete');
        if (autocomplete && autocomplete.classList.contains('open')) {
          return; // Let autocomplete handle Enter
        }

        if (text) {
          e.preventDefault();

          // Add animating class to hide placeholder during animation
          wrapper.classList.add('animating');

          triggerVanishEffect(text);

          // Clear input immediately (text invisible, ghosts visible)
          setTimeout(() => {
            input.value = '';
            previousValue = '';
          }, 10);

          // Remove animating class after animation completes to show placeholder
          setTimeout(() => {
            wrapper.classList.remove('animating');
          }, 1400);

          // Dispatch custom event
          container.dispatchEvent(new CustomEvent('vanish:submit', {
            detail: { value: text },
            bubbles: true
          }));
        }
      }
    });
  });
})();
