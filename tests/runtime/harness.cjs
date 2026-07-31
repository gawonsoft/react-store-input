const { afterEach, beforeEach } = require("node:test");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { useStoreInput } = require("../../dist/index.js");
const { useStore } = require("gw-store");

let dom;
let container;
let root;
let createRoot;

beforeEach(() => {
  dom = new JSDOM(
    "<!doctype html><html><body><div id='root'></div></body></html>",
    { url: "http://localhost" },
  );
  global.window = dom.window;
  global.document = dom.window.document;
  global.Event = dom.window.Event;
  global.MouseEvent = dom.window.MouseEvent;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.HTMLSelectElement = dom.window.HTMLSelectElement;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  createRoot ??= require("react-dom/client").createRoot;
  container = document.querySelector("#root");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  dom.window.close();
  delete global.window;
  delete global.document;
  delete global.Event;
  delete global.MouseEvent;
  delete global.HTMLElement;
  delete global.HTMLInputElement;
  delete global.HTMLSelectElement;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

async function mount(initialState, render) {
  let store;

  function App() {
    store = useStore(initialState);
    return render(useStoreInput(store), store);
  }

  await act(async () => root.render(React.createElement(App)));
  return store;
}

function setNativeValue(element, value) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(element),
    "value",
  ).set;
  setter.call(element, value);
}

module.exports = {
  React,
  act,
  getContainer: () => container,
  mount,
  setNativeValue,
};
