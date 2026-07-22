import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import type { Draft, Immutable } from "immer";

export type InputDisplayValue = string | number | readonly string[];
export type InputStateValue = string | string[];

export type StoreInputProps<
  TInputElement,
  TState extends object,
  TValue,
> = {
  type?: HTMLInputTypeAttribute;
  defaultValue?: InputDisplayValue;
  value?: InputDisplayValue;
  checked?: boolean;
  defaultChecked?: boolean;
  multiple?: boolean;
  onChange?: (event: ChangeEvent<TInputElement>) => void;
  getter: (state: Immutable<TState>) => TValue;
  setter: (state: Draft<TState>, value: TValue) => void;
  toInputValue?: (value: TValue) => InputDisplayValue;
  toStateValue?: (value: InputStateValue) => TValue;
};
