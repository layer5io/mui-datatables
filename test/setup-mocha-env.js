import Enzyme from 'enzyme';
import React from 'react';
import AdapterPkg from '@cfaester/enzyme-adapter-react-18';

const Adapter = AdapterPkg.default || AdapterPkg;

/* required when running >= 16.0 */
Enzyme.configure({ adapter: new Adapter() });

function setupDom() {
  const { JSDOM } = require('jsdom');
  const Node = require('jsdom/lib/jsdom/living/node-document-position');

  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost',
  });

  global.window = dom.window;
  global.document = window.document;
  global.Node = Node;

  global.navigator = {
    userAgent: 'node.js',
    appVersion: '',
  };
  global.localStorage = global.window.localStorage;
  global.sessionStorage = global.window.sessionStorage;

  function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
      .filter(prop => typeof target[prop] === 'undefined')
      .map(prop => Object.getOwnPropertyDescriptor(src, prop));
    Object.defineProperties(target, props);
  }

  copyProps(dom.window, global);

  const KEYS = ['HTMLElement'];
  KEYS.forEach(key => {
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

  global.requestAnimationFrame = callback => {
    setTimeout(callback, 0);
  };

  global.window.cancelAnimationFrame = () => {};
  global.getComputedStyle = global.window.getComputedStyle;
  global.HTMLInputElement = global.window.HTMLInputElement;
  global.Element = global.window.Element;
  global.Event = global.window.Event;
  global.dispatchEvent = global.window.dispatchEvent;
  global.window.getComputedStyle = () => ({});

  Object.defineProperty(global.window.URL, 'createObjectURL', { value: () => {} });
  const blobImpl = global.Blob || global.window.Blob;
  global.Blob = blobImpl;
  global.window.Blob = blobImpl;
}

setupDom();
console.error = function() {};
