# React Store Input

Typed, store-backed form controls for React 18 and 19. The package uses
[`gw-store`](https://www.npmjs.com/package/gw-store) 0.2.0, so state snapshots
are immutable and updates are made through Immer recipes.

## Install

```sh
npm install react-store-input
```

## Quick start

```tsx
import { useFormStore } from "react-store-input";

export default function LoginForm() {
  const form = useFormStore({
    email: "",
    password: "",
    rememberMe: false,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(form.state);
      }}
    >
      <form.input name="email" type="email" />
      <form.input name="password" type="password" />
      <form.input name="rememberMe" type="checkbox" />
      <button type="submit">Sign in</button>
    </form>
  );
}
```

`useFormStore` returns the complete `gw-store` API (`state`, `dispatch`,
`batch`, and `subscribe`) together with stable `input`, `select`, `textarea`,
and `render` helpers.

## Components

You can use the standalone components when the store is passed from elsewhere:

```tsx
import { Input, Select, Textarea, useStore } from "react-store-input";

const store = useStore({ role: "user", bio: "" });

<Input store={store} name="role" type="radio" value="admin" />;
<Input store={store} name="role" type="radio" value="user" />;
<Select store={store} name="role">
  <option value="admin">Admin</option>
  <option value="user">User</option>
</Select>;
<Textarea store={store} name="bio" rows={5} />;
```

A named `Input`, `Select`, or `Textarea` requires a valid top-level state key.
Use `useStoreInput` with a typed binding for nested or converted values.

## Value conversion

The default conversions are:

- checkbox → `boolean`
- radio → the original `value` prop, preserving numbers and strings
- number/range → `number`, or `undefined` when empty
- datetime-local → `Date`, or `undefined` when empty or invalid
- multiple select → `string[]`
- file → `FileList | null`
- other controls → `string`

Domain-specific conversions use a Codec as described below.

The controls are store-backed uncontrolled inputs. An explicit `value` or
`checked` prop is respected as an externally controlled value and is not
overwritten by store subscriptions. Native form reset is synchronized back to
the store.

## Lens, codec, and binding

A custom control is defined from three small pieces:

- A `Lens<TState, TValue>` selects and updates one domain value in the store.
- A `Codec<TValue, TInput, TError>` formats that domain value for the control
  and parses input back to a `gw-result` `Result`.
- An `InputBinding` combines a lens and codec whose `TValue` types must match.

Keeping the lens and codec separate lets one state field use different UI
representations, and lets one codec be reused for the same domain type in
different stores.

```tsx
import {
  defineBinding,
  defineCodec,
  err,
  ok,
  stateLens,
} from "react-store-input";

type FormState = { profile: { budget?: number } };
type BudgetError = { code: "INVALID_BUDGET"; input: string };

const budgetBinding = defineBinding({
  lens: stateLens<FormState>().prop("profile").prop("budget"),
  codec: defineCodec<number | undefined, string, BudgetError>({
    format: (value) => value?.toString() ?? "",
    parse: (input) => {
      if (input === "") return ok(undefined);

      const value = Number(input);
      return Number.isFinite(value)
        ? ok(value)
        : err({ code: "INVALID_BUDGET", input });
    },
  }),
});
```

`stateLens().prop(...)` creates `get` and `set` from the same typed path, so
they cannot accidentally target different fields. `defineLens` is also
available for computed or otherwise non-path mappings.

`ok`, `err`, and the `Result` type are re-exported from `gw-result@0.3.0` for
codec implementations.

## Rendering selected state

`useSelector`, `shallowEqual`, and the rest of `gw-store@0.2.0` are re-exported.

```tsx
import { createRender, useSelector } from "react-store-input";

const email = useSelector(store, (state) => state.email);

return (
  <>
    <p>{email}</p>
    {createRender(store, (state) => <p>{state.password.length} characters</p>)}
    {form.render((state) => <p>{state.rememberMe ? "Remember" : "Forget"}</p>)}
  </>
);
```

## Custom controls

Use `useStoreInput` with a binding for custom elements that expose a normal
form-control DOM node. The ref is deliberately explicit. A parse failure keeps
the last valid store value, preserves the user's raw input, and exposes the
typed error through `meta`.

```tsx
import { useRef } from "react";
import { useStoreInput, type Store } from "react-store-input";

function BudgetInput({ store }: { store: Store<FormState> }) {
  const ref = useRef<HTMLInputElement>(null);
  const field = useStoreInput(ref, store, budgetBinding, { type: "text" });

  return (
    <label>
      Budget
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        aria-invalid={!field.meta.valid}
        {...field.inputProps}
      />
      {!field.meta.valid && <span>{field.meta.error.code}</span>}
    </label>
  );
}
```

Generated lenses and codecs can be checked with the exported law assertions in
unit tests:

```ts
assertLensLaws(budgetBinding.lens, {
  state: { profile: { budget: 10 } },
  values: [undefined, 0, 25],
});

assertCodecLaws(budgetBinding.codec, {
  values: [undefined, 0, 25],
  inputs: ["", "0", "25"],
});
```

The lens assertions verify get-after-set, set-current-value, and last-set-wins.
The codec assertion verifies `parse(format(value))` for representative domain
values, plus `format(parse(input).value)` for successful canonical inputs when
`inputs` are supplied. Normalizing or lossy codecs may supply domain-specific
`equals` and `equalsInput` functions.

For non-input controllers, call the returned `dispatch` when the controller
changes:

```tsx
import { useStoreController } from "react-store-input";

function Counter({ store }: { store: Store<{ count: number }> }) {
  const { dispatch } = useStoreController(store, {
    onSubscribe: () => {},
    onDispatch: (state) => {
      state.count += 1;
    },
  });

  return <button onClick={dispatch}>Increment</button>;
}
```

## Optional text editor

The ProseMirror-based editor is a separate entry point so normal forms do not
download or bundle editor dependencies. It requires React 19 and an explicit
optional peer installation:

```sh
npm install gw-react-text-editor
```

```tsx
import { TextEditor } from "react-store-input/text-editor";

<TextEditor store={store} name="content" />;
```

## Development

Release history is tracked in [CHANGELOG.md](./CHANGELOG.md). The manual
pre-release checks are documented in [docs/PUBLISHING.md](./docs/PUBLISHING.md).

Source code is grouped by responsibility:

```text
src/
├─ binding/ Lens, Codec, Binding, and law assertions
├─ input/   DOM value conversion, reset coordination, and input hooks
├─ form/    bound components and useFormStore composition
├─ store/   controller and render helpers
└─ editor/  optional text-editor integration

example/src/
├─ components/  reusable demo UI
├─ sections/    one catalog section per capability group
├─ demo/        state model and initial data
└─ styles/      layout, fields, toolbar, state panel, and responsive rules
```

```sh
npm run typecheck
npm test
npm pack --dry-run
```
