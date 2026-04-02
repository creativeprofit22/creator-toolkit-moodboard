/**
 * Accordion Section Toggle
 * Converts h2 headers into collapsible sections with chevron icons
 */
(function() {
  // Find all sections with h2 headers
  const sections = document.querySelectorAll('main > section');

  sections.forEach((section, index) => {
    const h2 = section.querySelector('h2');
    if (!h2) return;

    // Add chevron icon to header
    const chevron = document.createElement('span');
    chevron.className = 'chevron ml-auto text-creator-muted';
    chevron.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
    h2.appendChild(chevron);
    h2.classList.add('section-header');

    // Wrap content after h2 in a container
    const content = document.createElement('div');
    content.className = 'section-content';

    // Move all siblings after h2 into the content wrapper
    while (h2.nextSibling) {
      content.appendChild(h2.nextSibling);
    }
    section.appendChild(content);

    // First section stays open, others start collapsed
    if (index === 0) {
      h2.classList.add('active');
    } else {
      content.classList.add('collapsed');
    }

    // Click handler
    h2.addEventListener('click', () => {
      const isCollapsed = content.classList.contains('collapsed');

      // Collapse all sections
      sections.forEach(s => {
        const sContent = s.querySelector('.section-content');
        const sHeader = s.querySelector('.section-header');
        if (sContent) sContent.classList.add('collapsed');
        if (sHeader) sHeader.classList.remove('active');
      });

      // Open clicked section (if it was collapsed)
      if (isCollapsed) {
        content.classList.remove('collapsed');
        h2.classList.add('active');
      }
    });
  });

  // Add section count indicator
  const mainEl = document.querySelector('main');
  if (mainEl && sections.length > 0) {
    const indicator = document.createElement('div');
    indicator.className = 'fixed bottom-6 right-6 bg-creator-card/90 backdrop-blur-lg rounded-full px-4 py-2 text-sm text-creator-muted border border-creator-border shadow-lg z-50';
    indicator.innerHTML = '<span class="text-creator-violet font-medium">' + sections.length + '</span> sections';
    document.body.appendChild(indicator);
  }
})();
