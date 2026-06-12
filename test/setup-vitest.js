'use strict';

// React 19 + Enzyme compatibility shims for Vitest. Mirrors master's setup-mocha-env.js.

// beforeAll/afterAll are Vitest globals (globals:true). Alias for Mocha-style tests.
global.before = beforeAll;
global.after = afterAll;

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// jsdom polyfills
if (global.document) {
  global.document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: { documentElement: window.document.body, parent: { nodeName: 'BODY' } },
    },
  });
}

global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

if (global.window) {
  global.window.cancelAnimationFrame = () => {};
  global.window.getComputedStyle = () => ({});
  Object.defineProperty(global.window.URL, 'createObjectURL', { value: () => {} });
  if (global.window.HTMLAnchorElement) global.window.HTMLAnchorElement.prototype.click = () => {};
}

const blobImpl = global.Blob || (global.window && global.window.Blob);
if (blobImpl) {
  global.Blob = blobImpl;
  if (global.window) global.window.Blob = blobImpl;
}

// React 19 removed __SECRET_INTERNALS; reconstruct it so react-shallow-renderer (Enzyme dep) can install its dispatcher.
const React = require('react');
if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    ReactCurrentDispatcher: { current: null },
    ReactCurrentBatchConfig: { transition: null },
    ReactDebugCurrentFrame: { getCurrentStack: () => '' },
    ReactCurrentOwner: { current: null },
  };

  // Prevent JSON.stringify circular-ref failures on frozen React elements with _owner fiber refs.
  const REACT_ELEMENT_SYMBOLS = new Set([Symbol.for('react.element'), Symbol.for('react.transitional.element')]);
  const origFreeze = Object.freeze;
  Object.freeze = function patchedFreeze(obj) {
    if (obj && typeof obj === 'object' && REACT_ELEMENT_SYMBOLS.has(obj.$$typeof)) return obj;
    return origFreeze.apply(Object, arguments);
  };
  const stripOwner = (el) => {
    if (el && typeof el === 'object' && REACT_ELEMENT_SYMBOLS.has(el.$$typeof)) {
      try {
        el._owner = null;
      } catch (_) {}
    }
    return el;
  };
  const origCreateElement = React.createElement;
  React.createElement = function patchedCreateElement() {
    return stripOwner(origCreateElement.apply(this, arguments));
  };
  for (const mod of ['react/jsx-runtime', 'react/jsx-dev-runtime']) {
    try {
      const rt = require(mod);
      for (const fn of ['jsx', 'jsxs', 'jsxDEV']) {
        if (typeof rt[fn] === 'function') {
          const orig = rt[fn];
          rt[fn] = function patchedJsx() {
            return stripOwner(orig.apply(this, arguments));
          };
        }
      }
    } catch (_) {}
  }

  // Proxy React hook calls through whatever dispatcher the shallow renderer installs.
  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const hooks = [
    'useState',
    'useReducer',
    'useContext',
    'useRef',
    'useEffect',
    'useLayoutEffect',
    'useInsertionEffect',
    'useCallback',
    'useMemo',
    'useImperativeHandle',
    'useDebugValue',
    'useTransition',
    'useDeferredValue',
    'useId',
    'useSyncExternalStore',
  ];
  for (const name of hooks) {
    const native = React[name];
    React[name] = function () {
      const dispatcher = internals.ReactCurrentDispatcher.current;
      if (dispatcher && typeof dispatcher[name] === 'function') return dispatcher[name].apply(dispatcher, arguments);
      return native.apply(React, arguments);
    };
  }
}

// React 19 removed Simulate from react-dom/test-utils; polyfill it via native DOM events.
const testUtils = require('react-dom/test-utils');
if (!testUtils.Simulate) {
  const eventCtor = (win, type) => {
    if (/^(click|dbl|mouse|drag|drop|wheel|context|pointer|touch)/.test(type) && win.MouseEvent) return win.MouseEvent;
    if (/^key/.test(type) && win.KeyboardEvent) return win.KeyboardEvent;
    if (/^(focus|blur)/.test(type) && win.FocusEvent) return win.FocusEvent;
    return win.Event;
  };
  const eventNames = [
    'click',
    'doubleClick',
    'mouseDown',
    'mouseUp',
    'mouseMove',
    'mouseEnter',
    'mouseLeave',
    'mouseOver',
    'mouseOut',
    'change',
    'input',
    'keyDown',
    'keyUp',
    'keyPress',
    'focus',
    'blur',
    'submit',
    'select',
    'paste',
    'copy',
    'cut',
    'drag',
    'drop',
    'dragStart',
    'dragEnd',
    'dragEnter',
    'dragLeave',
    'dragOver',
    'wheel',
    'touchStart',
    'touchEnd',
    'touchMove',
    'touchCancel',
    'pointerDown',
    'pointerUp',
    'pointerMove',
    'pointerEnter',
    'pointerLeave',
    'pointerOver',
    'pointerOut',
    'contextMenu',
    'scroll',
  ];
  const setInputValue = (node, value) => {
    // Reset React 19's value tracker so simulated changes always fire onChange.
    if (node._valueTracker && typeof node._valueTracker.setValue === 'function')
      node._valueTracker.setValue(String(value) + '__simulated__');
    const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'value');
    if (desc && desc.set) desc.set.call(node, value);
    else node.value = value;
  };
  const safeAssign = (event, mock) => {
    if (!mock) return;
    for (const key of Object.keys(mock)) {
      try {
        event[key] = mock[key];
      } catch (_) {}
    }
  };
  const eventNameAliases = { doubleClick: 'dblclick' };
  testUtils.Simulate = {};
  for (const name of eventNames) {
    testUtils.Simulate[name] = (node, mock = {}) => {
      if (!node) return;
      const win = node.ownerDocument ? node.ownerDocument.defaultView : global.window;
      const type = eventNameAliases[name] || name.toLowerCase();
      if (type === 'change' && mock && mock.target) {
        const isCheckable = node.tagName === 'INPUT' && (node.type === 'checkbox' || node.type === 'radio');
        if (isCheckable) {
          if ('checked' in mock.target) node.checked = mock.target.checked;
          node.dispatchEvent(new (win.MouseEvent || win.Event)('click', { bubbles: true, cancelable: true }));
          return;
        }
        if (
          'value' in mock.target &&
          (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT')
        ) {
          setInputValue(node, mock.target.value);
          node.dispatchEvent(new win.Event('input', { bubbles: true, cancelable: true }));
        }
      }
      const init = { bubbles: true, cancelable: true, ...(mock.nativeEvent || {}), ...mock };
      delete init.target;
      delete init.nativeEvent;
      const event = new (eventCtor(win, type))(type, init);
      safeAssign(event, mock);
      node.dispatchEvent(event);
    };
  }
}

// React 19 removed ReactDOM.findDOMNode; polyfill via fiber tree walk.
const ReactDOM = require('react-dom');
if (typeof ReactDOM.findDOMNode !== 'function') {
  ReactDOM.findDOMNode = (instance) => {
    if (!instance) return null;
    if (instance.nodeType) return instance;
    const fiber = instance._reactInternals || instance._reactInternalFiber;
    if (!fiber) return null;
    const queue = [fiber];
    for (let i = 0; i < queue.length; i++) {
      const f = queue[i];
      if (f.stateNode && f.stateNode.nodeType) return f.stateNode;
      let child = f.child;
      while (child) {
        queue.push(child);
        child = child.sibling;
      }
    }
    return null;
  };
}

// Enzyme setup
const Enzyme = require('enzyme');
const AdapterPkg = require('@cfaester/enzyme-adapter-react-18');
Enzyme.configure({ adapter: new (AdapterPkg.default || AdapterPkg)() });

// Suppress known React 19 / Enzyme noise; real errors still surface.
const _origError = console.error;
console.error = function (...args) {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('not wrapped in act(...)') ||
    msg.includes('findDOMNode is deprecated') ||
    msg.includes('roots directly with document.body is discouraged') ||
    msg.includes('ReactDOMTestUtils.act is deprecated') ||
    msg.includes('react-dom/test-utils') ||
    msg.includes('container that has already been passed to createRoot()')
  )
    return;
  _origError.apply(console, args);
};
