// jsdom must be set up before react / enzyme / adapter are loaded so that
// any module reading `globalThis.window` at import time sees the DOM.
function setupDom() {
  const { JSDOM } = require('jsdom');
  const Node = require('jsdom/lib/jsdom/living/node-document-position');

  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost',
  });

  global.window = dom.window;
  global.document = window.document;
  global.Node = Node;

  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'node.js', appVersion: '' },
    writable: true,
    configurable: true,
  });
  global.localStorage = global.window.localStorage;
  global.sessionStorage = global.window.sessionStorage;

  function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
      .filter((prop) => typeof target[prop] === 'undefined')
      .map((prop) => Object.getOwnPropertyDescriptor(src, prop));
    Object.defineProperties(target, props);
  }

  copyProps(dom.window, global);

  const KEYS = ['HTMLElement'];
  KEYS.forEach((key) => {
    global[key] = window[key];
  });

  global.document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: {
        documentElement: window.document.body,
        parent: {
          nodeName: 'BODY',
        },
      },
    },
  });

  global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
  };

  global.window.cancelAnimationFrame = () => {};
  global.getComputedStyle = global.window.getComputedStyle;
  global.HTMLInputElement = global.window.HTMLInputElement;
  global.Element = global.window.Element;
  // Intentionally not overriding global.Event / global.dispatchEvent: chai 6
  // dispatches its own PluginEvent (extending Event) to a native EventTarget,
  // and replacing Event with jsdom's class makes Node reject the dispatch.
  global.window.getComputedStyle = () => ({});

  Object.defineProperty(global.window.URL, 'createObjectURL', { value: () => {} });
  const blobImpl = global.Blob || global.window.Blob;
  global.Blob = blobImpl;
  global.window.Blob = blobImpl;
}

setupDom();

// React 19 removed the legacy internals object that enzyme's React 18 adapter
// (via react-shallow-renderer) writes its hook dispatcher into, and React 19's
// hooks read from a module-private `ReactSharedInternals` we can't reach.
// Reconstruct the React 18 surface and route React.use* calls through whatever
// dispatcher the shallow renderer parks on it during a render pass.
const React = require('react');
if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    ReactCurrentDispatcher: { current: null },
    ReactCurrentBatchConfig: { transition: null },
    ReactDebugCurrentFrame: { getCurrentStack: () => '' },
    ReactCurrentOwner: { current: null },
  };
  // React 19 retains a `_owner` reference (to the parent FiberNode) on every
  // element created during render and freezes the element so the back-reference
  // can't be cleared after the fact. Tests that JSON.stringify state containing
  // React elements (e.g. `customBodyRender` output stashed in displayData) trip
  // on the resulting fiber→DOM→fiber cycle. Skip Object.freeze for React
  // elements so we can null `_owner` at element creation time, then patch both
  // JSX entry points babel may emit.
  const REACT_ELEMENT_SYMBOLS = new Set([
    Symbol.for('react.element'),
    Symbol.for('react.transitional.element'),
  ]);
  const origFreeze = Object.freeze;
  Object.freeze = function patchedFreeze(obj) {
    if (obj && typeof obj === 'object' && REACT_ELEMENT_SYMBOLS.has(obj.$$typeof)) {
      return obj;
    }
    return origFreeze.apply(Object, arguments);
  };
  const stripOwner = (el) => {
    if (el && typeof el === 'object' && REACT_ELEMENT_SYMBOLS.has(el.$$typeof)) {
      try { el._owner = null; } catch (_) { /* still frozen elsewhere */ }
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
    } catch (_) { /* runtime variant not present */ }
  }

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
      if (dispatcher && typeof dispatcher[name] === 'function') {
        return dispatcher[name].apply(dispatcher, arguments);
      }
      return native.apply(React, arguments);
    };
  }
}

// React 19 stripped `Simulate` from `react-dom/test-utils`, but the enzyme
// React 18 adapter calls `Simulate[event](hostNode, mock)`. Reconstruct it by
// dispatching a native event on the host node — React 19 attaches its event
// listeners on the root container, so a bubbled native event hits them.
const testUtils = require('react-dom/test-utils');
if (!testUtils.Simulate) {
  const eventCtor = (win, type) => {
    if (/^(click|dbl|mouse|drag|drop|wheel|context|pointer|touch)/.test(type) && win.MouseEvent) return win.MouseEvent;
    if (/^key/.test(type) && win.KeyboardEvent) return win.KeyboardEvent;
    if (/^(focus|blur)/.test(type) && win.FocusEvent) return win.FocusEvent;
    return win.Event;
  };
  const eventNames = [
    'click', 'doubleClick', 'mouseDown', 'mouseUp', 'mouseMove', 'mouseEnter', 'mouseLeave',
    'mouseOver', 'mouseOut', 'change', 'input', 'keyDown', 'keyUp', 'keyPress',
    'focus', 'blur', 'submit', 'select', 'paste', 'copy', 'cut', 'drag', 'drop',
    'dragStart', 'dragEnd', 'dragEnter', 'dragLeave', 'dragOver', 'wheel',
    'touchStart', 'touchEnd', 'touchMove', 'touchCancel', 'pointerDown', 'pointerUp',
    'pointerMove', 'pointerEnter', 'pointerLeave', 'pointerOver', 'pointerOut',
    'contextMenu', 'scroll',
  ];
  const setInputValue = (node, value) => {
    // React 19 attaches a value tracker that suppresses onChange when the new
    // value matches the last tracked one. Reset the tracker so an empty-to-
    // empty assignment (a common test pattern) still produces a synthetic
    // onChange.
    if (node._valueTracker && typeof node._valueTracker.setValue === 'function') {
      node._valueTracker.setValue(String(value) + '__simulated__');
    }
    const proto = Object.getPrototypeOf(node);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(node, value);
    else node.value = value;
  };
  // `target` is a getter on native Event; skip it (and any other mock keys we
  // can't reassign) when copying the user's mock onto the dispatched event.
  const safeAssign = (event, mock) => {
    if (!mock) return;
    for (const key of Object.keys(mock)) {
      try {
        event[key] = mock[key];
      } catch (e) { /* ignore non-writable getters */ }
    }
  };
  // Most React event names lowercase cleanly to their native counterpart, but a
  // few don't — e.g. `doubleClick` is `dblclick`, not `doubleclick`.
  const eventNameAliases = { doubleClick: 'dblclick' };
  testUtils.Simulate = {};
  for (const name of eventNames) {
    testUtils.Simulate[name] = (node, mock = {}) => {
      if (!node) return;
      const win = node.ownerDocument ? node.ownerDocument.defaultView : global.window;
      const type = eventNameAliases[name] || name.toLowerCase();
      // React listens for native `input` (not `change`) on text inputs/textareas;
      // checkboxes/radios fire `change` from `click`. Mirror the host's behavior
      // so `simulate('change', { target: { value } })` actually updates state.
      if (type === 'change' && mock && mock.target) {
        const isCheckable = node.tagName === 'INPUT' && (node.type === 'checkbox' || node.type === 'radio');
        if (isCheckable) {
          if ('checked' in mock.target) node.checked = mock.target.checked;
          // React's checkbox onChange handler is wired to native `click`.
          const clickEvent = new (win.MouseEvent || win.Event)('click', { bubbles: true, cancelable: true });
          node.dispatchEvent(clickEvent);
          return;
        }
        if ('value' in mock.target && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT')) {
          setInputValue(node, mock.target.value);
          const inputEvent = new win.Event('input', { bubbles: true, cancelable: true });
          node.dispatchEvent(inputEvent);
        }
      }
      const Ctor = eventCtor(win, type);
      // Tests pass modifier keys via either `mock.shiftKey` or `mock.nativeEvent.shiftKey`;
      // both end up reflected on the native event we dispatch.
      const init = { bubbles: true, cancelable: true, ...(mock.nativeEvent || {}), ...mock };
      delete init.target;
      delete init.nativeEvent;
      const event = new Ctor(type, init);
      safeAssign(event, mock);
      node.dispatchEvent(event);
    };
  }
}

// React 19 dropped `findDOMNode` from react-dom; the enzyme React 18 adapter
// still calls it to resolve host nodes for class component instances.
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

const Enzyme = require('enzyme');
const AdapterPkg = require('@cfaester/enzyme-adapter-react-18');
const Adapter = AdapterPkg.default || AdapterPkg;

Enzyme.configure({ adapter: new Adapter() });

console.error = function () {};
