// Shim for CDN-loaded React to work with JSX runtime
const React = window.React;

// Add JSX runtime functions (these are essentially createElement wrappers)
// The JSX runtime is used by the "automatic" runtime in React 17+
React.jsx = function(type, props, key) {
  if (key !== undefined) {
    return React.createElement(type, { ...props, key });
  }
  return React.createElement(type, props);
};

React.jsxs = React.jsx; // jsxs is same as jsx but for static children
React.Fragment = React.Fragment || Symbol.for('react.fragment');

module.exports = React;
