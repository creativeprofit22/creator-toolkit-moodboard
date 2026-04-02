/**
 * Text Animation Interactive Script (Section 21)
 * Standalone text input with vanish and deletion effects
 */
(function() {
  const textAnimInput = document.getElementById('text-anim-input');
  const textAnimGhost = document.getElementById('text-anim-ghost');
  const textAnimSend = document.getElementById('text-anim-send');
  const placeholderTyping = document.getElementById('placeholder-typing');
  const placeholderContainer = document.getElementById('text-anim-placeholder');

  if (!textAnimInput) return;

  let previousValue = '';

  // Rotating placeholders
  const placeholders = [
    'Search for anything...',
    'Try typing something here',
    'Press Enter to vanish text',
    'Use Backspace to see deletion',
    'Watch the magic happen...'
  ];
  let currentPlaceholder = 0;

  function updatePlaceholder() {
    placeholderTyping.textContent = placeholders[currentPlaceholder];
    currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
  }

  // Initialize and rotate placeholders
  updatePlaceholder();
  setInterval(updatePlaceholder, 3000);

  // Hide placeholder when input has value
  textAnimInput.addEventListener('input', () => {
    placeholderContainer.style.display = textAnimInput.value ? 'none' : 'block';
  });

  textAnimInput.addEventListener('focus', () => {
    if (!textAnimInput.value) {
      placeholderContainer.style.display = 'block';
    }
  });

  // Get character position for ghost placement
  function getCharPosition(input, charIndex) {
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;font:inherit;white-space:pre;';
    span.textContent = input.value.substring(0, charIndex);
    input.parentElement.appendChild(span);
    const width = span.offsetWidth;
    span.remove();
    return width;
  }

  // Spawn deletion ghost with particles
  function spawnDeletionGhost(char, xPos) {
    if (!textAnimGhost || !char || char === ' ') return;

    // Character ghost (floats up, slightly slower)
    const ghost = document.createElement('span');
    ghost.className = 'char-ghost';
    ghost.textContent = char;
    ghost.style.left = xPos + 'px';
    ghost.style.top = '50%';
    ghost.style.transform = 'translateY(-50%)';
    textAnimGhost.appendChild(ghost);
    setTimeout(() => ghost.remove(), 300);

    // Spawn 2-3 particles flowing left
    const particleCount = 2 + Math.floor(Math.random() * 2);
    for (let p = 0; p < particleCount; p++) {
      const particle = document.createElement('span');
      particle.className = 'vanish-particle';
      particle.style.left = (xPos + 4) + 'px';
      particle.style.top = '50%';

      const flowX = -30 - Math.random() * 35; // Slightly longer flow
      const flowYEnd = (Math.random() - 0.5) * 18;

      particle.style.setProperty('--particle-size', (2 + Math.random() * 2) + 'px');
      particle.style.setProperty('--flow-x', flowX + 'px');
      particle.style.setProperty('--flow-y-start', '0px');
      particle.style.setProperty('--flow-y-end', flowYEnd + 'px');
      particle.style.setProperty('--particle-duration', (550 + Math.random() * 200) + 'ms');
      particle.style.setProperty('--particle-delay', (p * 50) + 'ms');

      textAnimGhost.appendChild(particle);
      setTimeout(() => particle.remove(), 850);
    }
  }

  // Track input for deletion detection
  textAnimInput.addEventListener('input', (e) => {
    const current = e.target.value;
    const prev = previousValue;

    if (prev.length - current.length === 1) {
      let deleteIndex = current.length;
      for (let i = 0; i < current.length; i++) {
        if (current[i] !== prev[i]) {
          deleteIndex = i;
          break;
        }
      }

      const deletedChar = prev[deleteIndex];
      const xPos = getCharPosition(textAnimInput, deleteIndex);
      spawnDeletionGhost(deletedChar, xPos);
    }

    previousValue = current;
  });

  // Vanish effect on submit (particle flow right-to-left)
  function triggerVanishEffect(text) {
    if (!textAnimGhost || !text) return;

    const chars = text.split('');
    const totalChars = chars.filter(c => c !== ' ').length;

    // Process characters right-to-left (reverse index for delay)
    chars.forEach((char, i) => {
      if (char === ' ') return;

      const xPos = getCharPosition(textAnimInput, i);
      const reverseIndex = totalChars - 1 - i; // Right-to-left delay

      // Fade the character (slightly slower)
      const charEl = document.createElement('span');
      charEl.className = 'char-vanish';
      charEl.textContent = char;
      charEl.style.left = xPos + 'px';
      charEl.style.top = '50%';
      charEl.style.setProperty('--fade-delay', (reverseIndex * 40) + 'ms');
      charEl.style.setProperty('--fade-duration', '180ms');
      textAnimGhost.appendChild(charEl);

      // Spawn 3-5 particles per character
      const particleCount = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < particleCount; p++) {
        const particle = document.createElement('span');
        particle.className = 'vanish-particle';

        // Position at character center
        particle.style.left = (xPos + 4) + 'px';
        particle.style.top = '50%';

        // Flow direction: always left, with slight vertical variance
        const flowX = -50 - Math.random() * 60; // -50 to -110px (leftward, longer trail)
        const flowYStart = (Math.random() - 0.5) * 8;
        const flowYEnd = (Math.random() - 0.5) * 20;

        // Particle properties (slower)
        const size = 2 + Math.random() * 3;
        const duration = 800 + Math.random() * 300; // 800-1100ms
        const delay = (reverseIndex * 40) + (p * 35); // Slower stagger

        particle.style.setProperty('--particle-size', size + 'px');
        particle.style.setProperty('--flow-x', flowX + 'px');
        particle.style.setProperty('--flow-y-start', flowYStart + 'px');
        particle.style.setProperty('--flow-y-end', flowYEnd + 'px');
        particle.style.setProperty('--particle-duration', duration + 'ms');
        particle.style.setProperty('--particle-delay', delay + 'ms');

        textAnimGhost.appendChild(particle);
      }
    });

    // Clear all elements after animation completes
    setTimeout(() => {
      textAnimGhost.querySelectorAll('.char-vanish, .vanish-particle').forEach(el => el.remove());
    }, 1800);
  }

  // Send button click
  textAnimSend.addEventListener('click', () => {
    const text = textAnimInput.value.trim();
    if (text) {
      triggerVanishEffect(text);
      // Clear input immediately but delay placeholder reappearance
      setTimeout(() => {
        textAnimInput.value = '';
        previousValue = '';
      }, 10);
      // Show placeholder after animation is mostly complete
      setTimeout(() => {
        placeholderContainer.style.display = 'block';
      }, 1400);
    }
  });

  // Enter key to send
  textAnimInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textAnimSend.click();
    }
  });
})();
