import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import type { StoreBindingMeta } from "../binding/use_store_binding";

export type InputDisplayValue = string | number | readonly string[];
export type InputStateValue = string | string[];
export type InputControlValue = string | readonly string[] | number | boolean | FileList | null;

export type StoreInputOptions<TInputElement> = {
  type?: HTMLInputTypeAttribute;
  defaultValue?: InputDisplayValue;
  value?: InputDisplayValue;
  checked?: boolean;
  defaultChecked?: boolean;
  multiple?: boolean;
  onChange?: (event: ChangeEvent<TInputElement>) => void;
};

export type StoreInputBindingOptions<TInputElement, TValue> = StoreInputOptions<TInputElement> & {
  resetValue?: TValue;
};

export type StoreInputDomProps<TInputElement> = {
  defaultValue?: InputDisplayValue;
  defaultChecked?: boolean;
  onChange: (event: ChangeEvent<TInputElement>) => void;
};

export type StoreInputMeta<TError> = StoreBindingMeta<TError>;

export type BindingInputResult<TInputElement, TError> = {
  inputProps: StoreInputDomProps<TInputElement>;
  meta: StoreInputMeta<TError>;
};
