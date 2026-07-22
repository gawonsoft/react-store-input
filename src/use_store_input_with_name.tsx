import type { RefObject } from "react";
import type { Store } from "gw-store";
import { useStoreInput, type StoreInputProps } from "./use_store_input";

export type InferNameFromProps<
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = undefined extends TName
  ? TValue
  : TName extends keyof TState
    ? TState[TName]
    : TValue;

type BoundStoreInputProps<
  TInputElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = StoreInputProps<
  TInputElement,
  TState,
  InferNameFromProps<TState, TName, TValue>
>;

type NamedBinding<
  TInputElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = {
  name: Exclude<TName, undefined>;
} & Partial<
  Pick<
    BoundStoreInputProps<TInputElement, TState, TName, TValue>,
    "getter" | "setter"
  >
>;

type CustomBinding<
  TInputElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = {
  name?: undefined;
} & Pick<
  BoundStoreInputProps<TInputElement, TState, TName, TValue>,
  "getter" | "setter"
>;

export type StoreInputWithNameProps<
  TInputElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = Omit<
  BoundStoreInputProps<TInputElement, TState, TName, TValue>,
  "getter" | "setter"
> &
  (
    | NamedBinding<TInputElement, TState, TName, TValue>
    | CustomBinding<TInputElement, TState, TName, TValue>
  );

export function useStoreInputWithName<
  TInputElement extends
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
>(
  ref: RefObject<TInputElement | null>,
  store: Store<TState>,
  props: StoreInputWithNameProps<TInputElement, TState, TName, TValue>,
) {
  const inputProps = useStoreInput(ref, store, {
    ...props,
    getter: (state) => {
      if (props.getter) {
        return props.getter(state);
      }

      return (state as Readonly<Record<PropertyKey, unknown>>)[
        props.name as PropertyKey
      ] as InferNameFromProps<TState, TName, TValue>;
    },
    setter: (state, value) => {
      if (props.setter) {
        props.setter(state, value);
        return;
      }

      (state as unknown as Record<PropertyKey, unknown>)[
        props.name as PropertyKey
      ] = value;
    },
  });

  return {
    ...inputProps,
    name: props.name === undefined ? undefined : String(props.name),
  };
}
