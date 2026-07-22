const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  assertCodecLaws,
  assertLensLaws,
  defineBinding,
  defineCodec,
  err,
  ok,
  stateLens,
  useStoreInput,
} = require("../../dist/index.js");
const {
  React,
  act,
  getContainer,
  mount,
  setNativeValue,
} = require("./harness.cjs");

const amountLens = stateLens().prop("form").prop("amount");
const amountCodec = defineCodec({
  format: (value) => String(value),
  parse: (input) => {
    if (!/^-?\d+$/.test(input)) {
      return err({ code: "INVALID_NUMBER", input });
    }

    return ok(Number(input));
  },
});
const amountBinding = defineBinding({
  lens: amountLens,
  codec: amountCodec,
});

test("generated lenses and codecs satisfy their round-trip laws", () => {
  assertLensLaws(amountLens, {
    state: { form: { amount: 5 } },
    values: [0, 10, 25],
  });
  assertCodecLaws(amountCodec, {
    values: [0, 10, -25],
    inputs: ["0", "10", "-25"],
  });
});

test("binding parse errors preserve store state and expose metadata", async () => {
  const store = await mount({ form: { amount: 5 }, revision: 0 }, (formStore) => {
    function BoundInput() {
      const ref = React.useRef(null);
      const field = useStoreInput(ref, formStore, amountBinding);

      return React.createElement(
        "form",
        null,
        React.createElement("input", {
          ref,
          ...field.inputProps,
          "data-valid": String(field.meta.valid),
          "data-error": field.meta.valid ? "" : field.meta.error.code,
        }),
        React.createElement("button", { type: "reset" }, "Reset"),
      );
    }

    return React.createElement(BoundInput);
  });
  const container = getContainer();
  const input = container.querySelector("input");
  const resetButton = container.querySelector("button");
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);

  await act(async () => {
    setNativeValue(input, "12");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  assert.equal(store.state.form.amount, 12);
  assert.equal(input.dataset.valid, "true");
  const notificationsBeforeError = notifications;

  await act(async () => {
    setNativeValue(input, "not-a-number");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  assert.equal(store.state.form.amount, 12);
  assert.equal(notifications, notificationsBeforeError);
  assert.equal(input.value, "not-a-number");
  assert.equal(input.dataset.valid, "false");
  assert.equal(input.dataset.error, "INVALID_NUMBER");

  await act(async () => {
    store.dispatch((state) => {
      state.revision += 1;
    });
  });

  assert.equal(store.state.revision, 1);
  assert.equal(input.value, "not-a-number");
  assert.equal(input.dataset.valid, "false");

  await act(async () => {
    resetButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  assert.equal(store.state.form.amount, 5);
  assert.equal(input.value, "5");
  assert.equal(input.dataset.valid, "true");
  unsubscribe();
});
