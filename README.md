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

A control must have either a valid state `name`, or both a custom `getter` and
`setter`. TypeScript rejects controls that provide neither mapping.

```tsx
<Input
  store={store}
  getter={(state) => state.profile.email}
  setter={(state, value) => {
    state.profile.email = value;
  }}
/>
```

## Value conversion

The default conversions are:

- checkbox → `boolean`
- radio → the original `value` prop, preserving numbers and strings
- number/range → `number`, or `undefined` when empty
- datetime-local → `Date`, or `undefined` when empty or invalid
- multiple select → `string[]`
- file → `FileList | null`
- other controls → `string`

Use `toInputValue` and `toStateValue` for domain-specific values:

```tsx
<form.select
  name="rememberMe"
  toInputValue={(value) => (value ? "yes" : "no")}
  toStateValue={(value) => value === "yes"}
>
  <option value="yes">Yes</option>
  <option value="no">No</option>
</form.select>
```

The controls are store-backed uncontrolled inputs. An explicit `value` or
`checked` prop is respected as an externally controlled value and is not
overwritten by store subscriptions. Native form reset is synchronized back to
the store.

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

Use `useStoreInput` for custom elements that expose a normal form-control DOM
node. The ref is deliberately explicit.

```tsx
import { useRef } from "react";
import { useStoreInput, type Store } from "react-store-input";

function EmailInput({ store }: { store: Store<{ email: string }> }) {
  const ref = useRef<HTMLInputElement>(null);
  const inputProps = useStoreInput(ref, store, {
    getter: (state) => state.email,
    setter: (state, value) => {
      state.email = value;
    },
  });

  return <input ref={ref} type="email" {...inputProps} />;
}
```

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
