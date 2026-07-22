const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  React,
  act,
  getContainer,
  mount,
  setNativeValue,
} = require("./harness.cjs");

test("respects an explicit false defaultChecked", async () => {
  await mount({ agree: true }, (store) =>
    React.createElement(store.input, {
      name: "agree",
      type: "checkbox",
      defaultChecked: false,
    }),
  );

  assert.equal(getContainer().querySelector("input").checked, false);
});

test("synchronizes external changes without emitting input events", async () => {
  let inputEvents = 0;
  const store = await mount({ email: "first" }, (form) =>
    React.createElement(form.input, {
      name: "email",
      onInput: () => inputEvents++,
    }),
  );
  const input = getContainer().querySelector("input");

  await act(async () => store.dispatch({ email: "second" }));

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
  const inputs = getContainer().querySelectorAll("input");

  await act(async () => inputs[1].click());

  assert.equal(store.state.choice, 2);
  assert.equal(typeof store.state.choice, "number");
  assert.equal(inputs[1].checked, true);
});

test("maps an empty number input to undefined", async () => {
  const store = await mount({ amount: 10 }, (form) =>
    React.createElement(form.input, { name: "amount", type: "number" }),
  );
  const input = getContainer().querySelector("input");

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
  const select = getContainer().querySelector("select");

  await act(async () => {
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  assert.deepEqual(store.state.colors, ["red", "blue"]);
});

test("stores null for an empty file input", async () => {
  const store = await mount({ attachment: null }, (form) =>
    React.createElement(form.input, {
      name: "attachment",
      type: "file",
    }),
  );
  const input = getContainer().querySelector("input");

  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  assert.equal(store.state.attachment, null);
});
