import { useMemo, type RefObject } from "react";
import { ok } from "gw-result";
import type { Store } from "gw-store";
import type { InputBinding } from "../binding/binding";
import { useStoreHTMLElement } from "./use_store_html_element";
import type { InputControlValue, InputStateValue, StoreInputOptions } from "./types";
import { convertToInputValue, convertToStateValue, resolveResetStateValue } from "./value_conversion";

type StoreElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type StoreInputWithNameProps<
  TInputElement,
  TState extends object,
  TName extends keyof TState,
> = StoreInputOptions<TInputElement> & {
  name: TName;
};

function formatControlValue<TValue>(value: TValue, type: StoreInputOptions<StoreElement>["type"]): InputControlValue {
  if (type === "checkbox") {
    return Boolean(value);
  }

  if (type === "radio" || type === "file") {
    return value as InputControlValue;
  }

  return convertToInputValue(value, type);
}

function parseControlValue<TValue>(value: InputControlValue, type: StoreInputOptions<StoreElement>["type"]): TValue {
  if (typeof value === "string" || Array.isArray(value)) {
    const stateInputValue: InputStateValue = Array.isArray(value) ? [...value] : value;
    return convertToStateValue(stateInputValue, type) as TValue;
  }

  return value as TValue;
}

export function useStoreInputWithName<
  TInputElement extends StoreElement,
  TState extends object,
  TName extends keyof TState,
>(
  ref: RefObject<TInputElement | null>,
  store: Store<TState>,
  props: StoreInputWithNameProps<TInputElement, TState, TName>,
) {
  type TValue = TState[TName];

  const binding = useMemo<InputBinding<TState, TValue, InputControlValue, never>>(
    () => ({
      lens: {
        get: (state) => (state as Readonly<Record<PropertyKey, unknown>>)[props.name as PropertyKey] as TValue,
        set: (state, value) => {
          (state as unknown as Record<PropertyKey, unknown>)[props.name as PropertyKey] = value;
        },
      },
      codec: {
        format: (value) => formatControlValue(value, props.type),
        parse: (value) => ok(parseControlValue<TValue>(value, props.type)),
      },
    }),
    [props.name, props.type],
  );
  const initialStateValue = binding.lens.get(store.state);
  const resetValue = resolveResetStateValue(props, initialStateValue, (value) =>
    parseControlValue<TValue>(value, props.type),
  );
  const { inputProps } = useStoreHTMLElement(ref, store, binding, {
    ...props,
    resetValue,
  });

  return {
    ...inputProps,
    name: String(props.name),
  };
}
