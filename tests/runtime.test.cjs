const { afterEach, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { useFormStore } = require("../dist/index.js");

let dom;
let container;
let root;
let createRoot;

beforeEach(() => {
  dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost",
  });
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
    store = useFormStore(initialState);
    return render(store);
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

test("respects an explicit false defaultChecked", async () => {
  await mount({ agree: true }, (store) =>
    React.createElement(store.input, {
      name: "agree",
      type: "checkbox",
      defaultChecked: false,
    }),
  );

  assert.equal(container.querySelector("input").checked, false);
});

test("synchronizes external changes without emitting input events", async () => {
  let inputEvents = 0;
  const store = await mount({ email: "first" }, (form) =>
    React.createElement(form.input, {
      name: "email",
      onInput: () => inputEvents++,
    }),
  );
  const input = container.querySelector("input");

  await act(async () => {
    store.dispatch({ email: "second" });
  });

  assert.equal(input.value, "second");
  assert.equal(inputEvents, 0);
});

test("preserves numeric radio values", async () => {
  const store = await mount({ choice: 1 }, (form) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(form.input, {
        name: "choice",
        type: "radio",
        value: 1,
      }),
      React.createElement(form.input, {
        name: "choice",
        type: "radio",
        value: 2,
      }),
    ),
  );
  const inputs = container.querySelectorAll("input");

  await act(async () => inputs[1].click());

  assert.equal(store.state.choice, 2);
  assert.equal(typeof store.state.choice, "number");
  assert.equal(inputs[1].checked, true);
});

test("maps an empty number input to undefined", async () => {
  const store = await mount({ amount: 10 }, (form) =>
    React.createElement(form.input, { name: "amount", type: "number" }),
  );
  const input = container.querySelector("input");

  await act(async () => {
    setNativeValue(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  assert.equal(store.state.amount, undefined);
});

test("stores every selected option from a multiple select", async () => {
  const store = await mount({ colors: ["red"] }, (form) =>
    React.createElement(
      form.select,
      { name: "colors", multiple: true },
      React.createElement("option", { value: "red" }, "Red"),
      React.createElement("option", { value: "blue" }, "Blue"),
    ),
  );
  const select = container.querySelector("select");

  await act(async () => {
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  assert.deepEqual(store.state.colors, ["red", "blue"]);
});

test("synchronizes native form reset back to the store", async () => {
  const initialState = {
    email: "first",
    password: "secret",
    rememberMe: false,
    role: "user",
  };
  const store = await mount(initialState, (form) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "form",
        null,
        React.createElement(form.input, { name: "email" }),
        React.createElement(form.input, { name: "password" }),
        React.createElement(form.input, {
          name: "rememberMe",
          type: "checkbox",
        }),
        React.createElement(form.input, {
          name: "role",
          type: "radio",
          value: "admin",
        }),
        React.createElement(form.input, {
          name: "role",
          type: "radio",
          value: "user",
        }),
        React.createElement("button", { type: "reset" }, "Reset"),
      ),
      form.render((state) =>
        React.createElement("pre", null, JSON.stringify(state)),
      ),
    ),
  );
  const [email, password, rememberMe, admin, user] =
    container.querySelectorAll("input");
  const form = container.querySelector("form");

  await act(async () => {
    setNativeValue(email, "second");
    email.dispatchEvent(new Event("input", { bubbles: true }));
    setNativeValue(password, "changed");
    password.dispatchEvent(new Event("input", { bubbles: true }));
    rememberMe.click();
    admin.click();
  });
  assert.deepEqual(store.state, {
    email: "second",
    password: "changed",
    rememberMe: true,
    role: "admin",
  });

  await act(async () => {
    form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    queueMicrotask(() => {
      setNativeValue(email, email.defaultValue);
      setNativeValue(password, password.defaultValue);
      rememberMe.checked = rememberMe.defaultChecked;
      admin.checked = admin.defaultChecked;
      user.checked = user.defaultChecked;
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.deepEqual(store.state, initialState);
  assert.deepEqual(JSON.parse(container.querySelector("pre").textContent), initialState);
});
