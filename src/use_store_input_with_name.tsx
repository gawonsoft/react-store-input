import type { RefObject } from "react";
import type { Store } from "gw-store";
import { useStoreInput, type StoreInputProps } from "./use_store_input";

export type InferNameFromProps<
  TState,
  TName extends keyof TState | undefined,
  TValue,
> = undefined extends TName
  ? TValue
  : TName extends keyof TState
    ? TState[TName]
    : TValue;

export type StoreInputWithNameProps<
  TInputElement,
  TState,
  TName extends keyof TState | undefined,
  TValue,
> = Omit<
  StoreInputProps<
    TInputElement,
    TState,
    InferNameFromProps<TState, TName, TValue>
  >,
  "getter" | "setter"
> &
  Partial<
    Pick<
      StoreInputProps<
        TInputElement,
        TState,
        InferNameFromProps<TState, TName, TValue>
      >,
      "getter" | "setter"
    >
  > & {
    name?: TName;
  };

export function useStoreInputWithName<
  TInputElement extends
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
  TState,
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

      return state[props.name as never];
    },
    setter: (state, value) => {
      if (props.setter) {
        props.setter(state, value);

        return;
      }

      state[props.name as never] = value as never;
    },
  });

  return {
    ...inputProps,
    name: "name" in props ? String(props.name) : undefined,
  };
}
