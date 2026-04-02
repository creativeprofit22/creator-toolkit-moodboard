// JSX Runtime shim for CDN-loaded React
const React = window.React;

// jsx and jsxs are essentially createElement wrappers
function jsx(type, props, key) {
  if (key !== undefined) {
    return React.createElement(type, { ...props, key });
  }
  return React.createElement(type, props);
}

// jsxs is used for static children, same as jsx
const jsxs = jsx;

const Fragment = React.Fragment;

module.exports = { jsx, jsxs, Fragment };
