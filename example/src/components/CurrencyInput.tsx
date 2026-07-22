import { useRef } from "react";
import { useStoreInput, type Store } from "react-store-input";
import type { DemoState } from "../demo/state";

export function CurrencyInput({ store }: { store: Store<DemoState> }) {
  const ref = useRef<HTMLInputElement>(null);
  const inputProps = useStoreInput(ref, store, {
    type: "number",
    getter: (state) => state.budget,
    setter: (state, value) => {
      state.budget = value;
    },
    toInputValue: (value) => value ?? "",
    toStateValue: (value) => (value === "" ? undefined : Number(value)),
  });

  return <input {...inputProps} ref={ref} type="number" step={100} />;
}
