/**
 * Buttons Interactive Script (Section 22)
 * Features: Radio button group toggle, Loading button demo
 */
(function() {
  // Radio Button Group Toggle
  const radioGroup = document.getElementById('radio-demo');
  if (radioGroup) {
    const containers = radioGroup.querySelectorAll('.radio-container');
    containers.forEach(container => {
      container.addEventListener('click', () => {
        containers.forEach(c => c.classList.remove('active'));
        container.classList.add('active');
        container.querySelector('input').checked = true;
      });
    });
  }

  // Loading Button Demo
  const loadingBtn = document.getElementById('btn-loading-demo');
  const triggerBtn = document.getElementById('btn-trigger-loading');

  if (triggerBtn && loadingBtn) {
    triggerBtn.addEventListener('click', () => {
      // Toggle loading state on the demo button
      if (loadingBtn.classList.contains('btn-loading')) {
        loadingBtn.classList.remove('btn-loading');
        loadingBtn.querySelector('.btn-text').textContent = 'Save';
      } else {
        loadingBtn.classList.add('btn-loading');
        loadingBtn.querySelector('.btn-text').textContent = 'Saving...';

        // Auto-reset after 2 seconds
        setTimeout(() => {
          loadingBtn.classList.remove('btn-loading');
          loadingBtn.querySelector('.btn-text').textContent = 'Saved!';
          setTimeout(() => {
            loadingBtn.querySelector('.btn-text').textContent = 'Save';
          }, 1000);
        }, 2000);
      }
    });
  }
})();
