# react-store-input interactive catalog

The Vite example is an interactive capability map for the package. It covers:

- text, email, password, search, tel, URL, hidden, file, and color inputs;
- number, range, date, time, datetime-local, month, and week conversion;
- checkbox, radio, select, boolean conversion, and multiple select;
- store-bound and standalone `Input`, `Select`, and `Textarea` components;
- nested and converted custom `useStoreHTMLElement` components built from typed
  lenses, codecs, bindings, and `gw-result` parse errors;
- direct `store.dispatch`, `useSelector`, `createRender`, and `batch`;
- native form reset synchronized back to live JSON state without an explicit
  `onReset` handler;
- the optional lazy-loaded `react-store-input/text-editor` entry point.

```sh
npm install
npm run dev
```

The example resolves the root package to `../src` for immediate HMR and dedupes
React so linked dependencies share the application's React singleton.
