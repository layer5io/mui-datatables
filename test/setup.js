import Enzyme from 'enzyme';
import AdapterPkg from '@cfaester/enzyme-adapter-react-18';
import { beforeAll, afterAll } from 'vitest';

global.before = beforeAll;
global.after = afterAll;

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
}

const blobImpl = global.Blob || global.window?.Blob;
if (blobImpl) {
  global.Blob = blobImpl;
  if (global.window) global.window.Blob = blobImpl;
}

// console.error = function () {}; // Removed so Vitest can report test errors properly
