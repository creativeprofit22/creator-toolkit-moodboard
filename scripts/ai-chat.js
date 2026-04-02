/**
 * AI Chat Component Interactive Script
 * Features: Mode switching, vanish effects, deletion ghosts, minimize/expand
 */
(function() {
  const chatContainer = document.getElementById('ai-chat-demo');
  const tabGeneral = document.getElementById('tab-general');
  const tabSocial = document.getElementById('tab-social');
  const messagesGeneral = document.getElementById('messages-general');
  const messagesSocial = document.getElementById('messages-social');
  const quickActions = document.getElementById('quick-actions');
  const inputWrapper = document.getElementById('input-wrapper');
  const sendBtn = document.getElementById('send-btn');
  const minimizeBtn = document.getElementById('minimize-btn');
  const chatInput = document.getElementById('chat-input');
  const ghostContainer = document.getElementById('ghost-container');
  const vanishWrapper = document.getElementById('vanish-wrapper');

  if (!chatContainer) return;

  let currentMode = 'general';
  let isMinimized = false;
  let previousValue = '';

  // ===== Text Animation: Single-letter deletion effect =====
  function getCharPosition(input, charIndex) {
    // Create a temporary span to measure character position
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;font:inherit;white-space:pre;';
    span.textContent = input.value.substring(0, charIndex);
    input.parentElement.appendChild(span);
    const width = span.offsetWidth;
    span.remove();
    return width + 12; // 12px padding offset
  }

  function spawnDeletionGhost(char, xPos) {
    if (!ghostContainer || !char || char === ' ') return;

    const modeClass = currentMode === 'social' ? ' social-mode' : '';

    // Character ghost (floats up, slightly slower)
    const ghost = document.createElement('span');
    ghost.className = 'char-ghost' + modeClass;
    ghost.textContent = char;
    ghost.style.left = xPos + 'px';
    ghost.style.top = '50%';
    ghost.style.transform = 'translateY(-50%)';
    ghostContainer.appendChild(ghost);
    setTimeout(() => ghost.remove(), 300);

    // Spawn 2-3 particles flowing left
    const particleCount = 2 + Math.floor(Math.random() * 2);
    for (let p = 0; p < particleCount; p++) {
      const particle = document.createElement('span');
      particle.className = 'vanish-particle' + modeClass;
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

      ghostContainer.appendChild(particle);
      setTimeout(() => particle.remove(), 850);
    }
  }

  // Track input changes for deletion detection
  chatInput.addEventListener('input', (e) => {
    const current = e.target.value;
    const prev = previousValue;

    // Detect single character deletion (backspace)
    if (prev.length - current.length === 1) {
      // Find which character was deleted
      let deleteIndex = 0;
      for (let i = 0; i < current.length; i++) {
        if (current[i] !== prev[i]) {
          deleteIndex = i;
          break;
        } else if (i === current.length - 1) {
          deleteIndex = current.length;
        }
      }

      const deletedChar = prev[deleteIndex];
      const xPos = getCharPosition(chatInput, deleteIndex);
      spawnDeletionGhost(deletedChar, xPos);
    }

    previousValue = current;
  });

  // ===== Text Animation: Vanish effect on submit (particle flow right-to-left) =====
  function triggerVanishEffect(text) {
    if (!ghostContainer || !text) return;

    const chars = text.split('');
    const totalChars = chars.filter(c => c !== ' ').length;
    const socialMode = currentMode === 'social';
    const modeClass = socialMode ? ' social-mode' : '';

    // Process characters right-to-left (reverse index for delay)
    chars.forEach((char, i) => {
      if (char === ' ') return;

      const xPos = getCharPosition(chatInput, i);
      const reverseIndex = totalChars - 1 - i; // Right-to-left delay

      // Fade the character (slightly slower)
      const charEl = document.createElement('span');
      charEl.className = 'char-vanish' + modeClass;
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
        particle.className = 'vanish-particle' + modeClass;

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

        ghostContainer.appendChild(particle);
      }
    });

    // Clear all elements after animation completes
    setTimeout(() => {
      ghostContainer.querySelectorAll('.char-vanish, .vanish-particle').forEach(el => el.remove());
    }, 1800);
  }

  // Mode switching
  function switchMode(mode) {
    currentMode = mode;

    // Update tabs
    tabGeneral.classList.remove('active-general', 'active-social');
    tabSocial.classList.remove('active-general', 'active-social');

    if (mode === 'general') {
      tabGeneral.classList.add('active-general');
      messagesGeneral.style.display = 'flex';
      messagesSocial.style.display = 'none';
      messagesGeneral.classList.add('switching');
      setTimeout(() => messagesGeneral.classList.remove('switching'), 300);

      // Update quick actions for general mode
      quickActions.innerHTML = `
        <button class="action-chip">Hook ideas</button>
        <button class="action-chip">Title options</button>
        <button class="action-chip">Script outline</button>
        <button class="action-chip">Thumbnail concepts</button>
      `;

      // Update input and send button
      inputWrapper.classList.remove('social-mode');
      sendBtn.classList.remove('social-mode');
      chatInput.placeholder = 'Ask me anything about your content...';

    } else {
      tabSocial.classList.add('active-social');
      messagesGeneral.style.display = 'none';
      messagesSocial.style.display = 'flex';
      messagesSocial.classList.add('switching');
      setTimeout(() => messagesSocial.classList.remove('switching'), 300);

      // Update quick actions for social mode
      quickActions.innerHTML = `
        <button class="action-chip social-mode">Caption ideas</button>
        <button class="action-chip social-mode">Hashtag sets</button>
        <button class="action-chip social-mode">Posting times</button>
        <button class="action-chip social-mode">Carousel layout</button>
      `;

      // Update input and send button
      inputWrapper.classList.add('social-mode');
      sendBtn.classList.add('social-mode');
      chatInput.placeholder = 'Ask about social media strategy...';
    }
  }

  tabGeneral.addEventListener('click', () => switchMode('general'));
  tabSocial.addEventListener('click', () => switchMode('social'));

  // Minimize/expand functionality
  minimizeBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;

    if (isMinimized) {
      chatContainer.classList.add('collapsing');
      chatContainer.classList.remove('expanding');
      setTimeout(() => {
        chatContainer.classList.add('minimized');
        chatContainer.classList.remove('collapsing');
      }, 400);
    } else {
      chatContainer.classList.remove('minimized');
      chatContainer.classList.add('expanding');
      setTimeout(() => {
        chatContainer.classList.remove('expanding');
      }, 400);
    }
  });

  // Quick action chip clicks (just for demo visual feedback)
  quickActions.addEventListener('click', (e) => {
    if (e.target.classList.contains('action-chip')) {
      // Visual feedback
      e.target.style.transform = 'scale(0.95)';
      setTimeout(() => {
        e.target.style.transform = '';
      }, 150);
    }
  });

  // Send button click with vanish effect
  sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text) {
      // Store original placeholder and hide it during animation
      const originalPlaceholder = chatInput.placeholder;
      chatInput.placeholder = '';

      // Trigger vanish animation
      triggerVanishEffect(text);

      // Clear input after a tiny delay so vanish can read position
      setTimeout(() => {
        chatInput.value = '';
        previousValue = '';
      }, 10);

      // Restore placeholder after animation completes (1.8s + small buffer)
      setTimeout(() => {
        chatInput.placeholder = originalPlaceholder;
      }, 2000);

      // Flash thinking indicator
      const thinkingEl = currentMode === 'general'
        ? document.getElementById('thinking-general')
        : document.getElementById('thinking-social');
      if (thinkingEl) {
        thinkingEl.style.display = 'flex';
        setTimeout(() => {
          thinkingEl.style.display = '';
        }, 2000);
      }
    }
  });

  // Enter key to send
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });
})();
