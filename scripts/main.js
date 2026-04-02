/**
 * Main initialization script
 * Loads all component scripts in order
 *
 * Script load order:
 * 1. accordion.js - Section toggle functionality
 * 2. ai-chat.js - AI Chat component with vanish effects
 * 3. text-animation.js - Standalone text animation demo
 * 4. echarts-init.js - All ECharts visualizations (requires echarts library)
 * 5. buttons.js - Button interactions
 *
 * Usage in HTML:
 * <script src="src/scripts/accordion.js"></script>
 * <script src="src/scripts/ai-chat.js"></script>
 * <script src="src/scripts/text-animation.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
 * <script src="src/scripts/echarts-init.js"></script>
 * <script src="src/scripts/buttons.js"></script>
 *
 * Or bundle with: cat accordion.js ai-chat.js text-animation.js echarts-init.js buttons.js > bundle.js
 */

// This file serves as documentation for script loading order
// All functionality is in the individual module files

// If you need a single entry point, you can dynamically load scripts:
(function() {
  const scripts = [
    'accordion.js',
    'ai-chat.js',
    'text-animation.js',
    'echarts-init.js',
    'buttons.js'
  ];

  // Check if we should auto-load (set data-autoload="true" on this script tag)
  const currentScript = document.currentScript;
  if (currentScript && currentScript.dataset.autoload === 'true') {
    const basePath = currentScript.src.replace('main.js', '');

    scripts.forEach((script, index) => {
      const el = document.createElement('script');
      el.src = basePath + script;
      el.defer = true;
      document.head.appendChild(el);
    });
  }
})();
