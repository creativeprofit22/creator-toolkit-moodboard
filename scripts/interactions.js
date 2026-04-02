/**
 * Interactive Effects
 * 3D Tilt Card, Progress Counters, and other UI interactions
 */

// 3D Tilt Effect
(function() {
  const card = document.getElementById('tilt-card');
  if (!card) return;

  const maxTilt = 15; // Maximum tilt angle in degrees
  const shadowIntensity = 30; // Maximum shadow offset in pixels

  function handleMouseMove(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    // Calculate rotation angles based on cursor position
    const rotateY = ((x - centerX) / halfWidth) * maxTilt;
    const rotateX = ((centerY - y) / halfHeight) * maxTilt;

    // Calculate shadow offset (opposite to tilt direction for realistic lighting)
    const shadowX = -rotateY * (shadowIntensity / maxTilt);
    const shadowY = rotateX * (shadowIntensity / maxTilt);

    // Apply the transform and dynamic shadow
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(167, 139, 250, 0.15), 0 10px 40px rgba(0, 0, 0, 0.3)`;
  }

  function handleMouseLeave() {
    // Reset to original state with smooth transition
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
  }

  function handleMouseEnter() {
    // Ensure smooth transitions are active
    card.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
  }

  // Add event listeners
  card.addEventListener('mouseenter', handleMouseEnter);
  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);

  // Set initial shadow
  card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
})();

// Progress Counter Animation
(function() {
  const counters = document.querySelectorAll('.progress-counter');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target) || 80;
    const duration = 2000;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      counter.textContent = current + '%';

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  });
})();
