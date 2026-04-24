import Enzyme from 'enzyme';
import AdapterPkg from '@cfaester/enzyme-adapter-react-18';
import { beforeAll, afterAll } from 'vitest';

global.before = beforeAll;
global.after = afterAll;

// jsdom@26+ is stricter: timers that fire after the environment is torn down
// throw "window is not defined". This afterAll flushes any pending
// react-transition-group animation timeouts while jsdom is still alive.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});

const Adapter = AdapterPkg.default || AdapterPkg;

/* required when running >= 16.0 */
Enzyme.configure({ adapter: new Adapter() });

// Keep any mocked DOM functions necessary for the tests that Vitest's jsdom might not perfectly simulate yet
if (global.document) {
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
}

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

if (global.window) {
  global.window.cancelAnimationFrame = () => {};
  global.window.getComputedStyle = () => ({});
  Object.defineProperty(global.window.URL, 'createObjectURL', { value: () => {} });

  if (global.window.HTMLAnchorElement) {
    global.window.HTMLAnchorElement.prototype.click = () => {};
  }
}

const blobImpl = global.Blob || global.window?.Blob;
if (blobImpl) {
  global.Blob = blobImpl;
  if (global.window) global.window.Blob = blobImpl;
}

const originalConsoleError = console.error;
console.error = function (...args) {
  const msg = args[0] || '';
  if (
    typeof msg === 'string' &&
    (msg.includes('not wrapped in act(...)') ||
      msg.includes('findDOMNode is deprecated') ||
      msg.includes('roots directly with document.body is discouraged') ||
      msg.includes('ReactDOMTestUtils.act is deprecated') ||
      msg.includes('container that has already been passed to createRoot()'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
