import { useRef } from "react";
import {
  defineBinding,
  defineCodec,
  err,
  ok,
  stateLens,
  useStoreInput,
  type Store,
} from "react-store-input";
import type { DemoState } from "../demo/state";

type BudgetError = {
  code: "INVALID_CURRENCY";
  input: string;
};

const budgetBinding = defineBinding({
  lens: stateLens<DemoState>().prop("budget"),
  codec: defineCodec<number | undefined, string, BudgetError>({
    format: (value) =>
      value === undefined ? "" : new Intl.NumberFormat("en-US").format(value),
    parse: (input) => {
      const normalized = input.replaceAll(",", "").trim();

      if (normalized === "") {
        return ok(undefined);
      }

      if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
        return err({ code: "INVALID_CURRENCY", input });
      }

      return ok(Number(normalized));
    },
  }),
});

export function CurrencyInput({ store }: { store: Store<DemoState> }) {
  const ref = useRef<HTMLInputElement>(null);
  const field = useStoreInput(ref, store, budgetBinding, { type: "text" });

  return (
    <div className="binding-input">
      <input
        {...field.inputProps}
        ref={ref}
        type="text"
        inputMode="decimal"
        aria-invalid={!field.meta.valid}
        aria-describedby="budget-error"
        placeholder="Try 2,500 or invalid text"
      />
      <span id="budget-error" className="binding-error" aria-live="polite">
        {field.meta.valid
          ? "Lens selects the field; codec validates and converts it."
          : `“${field.meta.error.input}” is not a valid currency value.`}
      </span>
    </div>
  );
}
