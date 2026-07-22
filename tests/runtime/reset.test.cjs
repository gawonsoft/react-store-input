const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  React,
  act,
  getContainer,
  mount,
  setNativeValue,
} = require("./harness.cjs");

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
  const container = getContainer();
  const [email, password, rememberMe, admin, user] =
    container.querySelectorAll("input");
  const form = container.querySelector("form");
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);

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
  const notificationsBeforeReset = notifications;

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
  assert.equal(notifications, notificationsBeforeReset + 1);
  unsubscribe();
});

test("resets bound fields from a reset button without an onReset handler", async () => {
  const initialState = {
    email: "first",
    rememberMe: false,
    interests: ["typescript"],
  };
  const store = await mount(initialState, (form) =>
    React.createElement(
      "form",
      null,
      React.createElement(form.input, { name: "email" }),
      React.createElement(form.input, {
        name: "rememberMe",
        type: "checkbox",
      }),
      React.createElement(
        form.select,
        { name: "interests", multiple: true },
        React.createElement("option", { value: "typescript" }, "TypeScript"),
        React.createElement("option", { value: "forms" }, "Forms"),
      ),
      React.createElement("button", { type: "reset" }, "Reset all"),
    ),
  );
  const container = getContainer();
  const input = container.querySelector('input[name="email"]');
  const checkbox = container.querySelector('input[name="rememberMe"]');
  const select = container.querySelector("select");
  const resetButton = container.querySelector("button");
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);

  await act(async () => {
    setNativeValue(input, "second");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    checkbox.click();
    select.options[0].selected = false;
    select.options[1].selected = true;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const notificationsBeforeReset = notifications;

  await act(async () => {
    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.deepEqual(store.state, initialState);
  assert.equal(input.value, initialState.email);
  assert.equal(checkbox.checked, initialState.rememberMe);
  assert.deepEqual(
    Array.from(select.options)
      .filter((option) => option.selected)
      .map((option) => option.value),
    initialState.interests,
  );
  assert.equal(notifications, notificationsBeforeReset + 1);
  unsubscribe();
});

test("resets named fields to explicit DOM defaults", async () => {
  const store = await mount({ agree: true, amount: 10 }, (form) =>
    React.createElement(
      "form",
      null,
      React.createElement(form.input, {
        name: "agree",
        type: "checkbox",
        defaultChecked: false,
      }),
      React.createElement(form.input, {
        name: "amount",
        type: "number",
        defaultValue: 5,
      }),
      React.createElement("button", { type: "reset" }, "Reset"),
    ),
  );
  const container = getContainer();
  const [checkbox, amount] = container.querySelectorAll("input");
  const resetButton = container.querySelector("button");

  await act(async () => {
    checkbox.click();
    setNativeValue(amount, "8");
    amount.dispatchEvent(new Event("input", { bubbles: true }));
  });

  assert.equal(checkbox.checked, true);
  assert.equal(store.state.amount, 8);

  await act(async () => {
    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.equal(store.state.agree, false);
  assert.equal(store.state.amount, 5);
  assert.equal(checkbox.checked, false);
  assert.equal(amount.value, "5");
});

test("does not notify when reset values are already semantically equal", async () => {
  const initialState = {
    meetingAt: new Date(2026, 6, 22, 14, 30),
    interests: ["typescript", "forms"],
  };
  const store = await mount(initialState, (form) =>
    React.createElement(
      "form",
      null,
      React.createElement(form.input, {
        name: "meetingAt",
        type: "datetime-local",
      }),
      React.createElement(
        form.select,
        { name: "interests", multiple: true },
        React.createElement("option", { value: "typescript" }, "TypeScript"),
        React.createElement("option", { value: "forms" }, "Forms"),
      ),
    ),
  );
  const form = getContainer().querySelector("form");
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);

  await act(async () => {
    form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.equal(notifications, 0);
  unsubscribe();
});

test("supports a full-store reset handler without duplicate notifications", async () => {
  const initialState = { email: "first", revision: 0 };
  const store = await mount(initialState, (form) =>
    React.createElement(
      "form",
      { onReset: () => form.dispatch(initialState) },
      React.createElement(form.input, { name: "email" }),
      React.createElement("button", { type: "reset" }, "Reset all"),
    ),
  );
  const container = getContainer();
  const input = container.querySelector("input");
  const resetButton = container.querySelector("button");
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);

  await act(async () => {
    setNativeValue(input, "second");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    store.dispatch({ revision: 1 });
  });
  const notificationsBeforeReset = notifications;

  await act(async () => {
    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.deepEqual(store.state, initialState);
  assert.equal(input.value, initialState.email);
  assert.equal(notifications, notificationsBeforeReset + 1);
  unsubscribe();
});
