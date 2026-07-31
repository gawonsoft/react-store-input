import type { HTMLInputTypeAttribute } from "react";
import { formatDateTimeLocal } from "./dom_value";
import type { InputDisplayValue, InputStateValue, StoreInputOptions } from "./types";

export function convertToInputValue<TValue>(value: TValue, type?: HTMLInputTypeAttribute): InputDisplayValue {
  if (value === undefined || value === null) {
    return "";
  }

  if (type === "datetime-local") {
    return formatDateTimeLocal(value);
  }

  return Array.isArray(value) ? value.map(String) : String(value);
}

export function convertToChecked(value: unknown, type?: HTMLInputTypeAttribute, inputValue?: InputDisplayValue) {
  return type === "radio" ? value !== undefined && Object.is(value, inputValue) : Boolean(value);
}

export function convertToStateValue(value: InputStateValue, type?: HTMLInputTypeAttribute): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (type === "number" || type === "range") {
    return value === "" ? undefined : Number(value);
  }

  if (type === "datetime-local") {
    if (value === "") {
      return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return value;
}

export function resolveDefaultValue<TInputElement, TValue>(
  props: StoreInputOptions<TInputElement>,
  stateValue: TValue,
  format: (value: TValue) => InputDisplayValue,
) {
  if (props.type !== "radio" && props.value !== undefined) {
    return undefined;
  }

  if (props.defaultValue !== undefined) {
    return props.defaultValue;
  }

  if (props.type === "checkbox" || props.type === "radio" || props.type === "file") {
    return undefined;
  }

  return format(stateValue);
}

export function resolveDefaultChecked<TInputElement, TValue>(
  props: StoreInputOptions<TInputElement>,
  stateValue: TValue,
  toChecked: (value: TValue) => boolean,
) {
  if (props.checked !== undefined) {
    return undefined;
  }

  if (props.defaultChecked !== undefined) {
    return props.defaultChecked;
  }

  return props.type === "checkbox" || props.type === "radio" ? toChecked(stateValue) : undefined;
}

export function resolveResetStateValue<TInputElement, TValue>(
  props: StoreInputOptions<TInputElement>,
  stateValue: TValue,
  parse: (value: InputStateValue) => TValue,
): TValue {
  if (props.type === "checkbox" && props.defaultChecked !== undefined) {
    return props.defaultChecked as TValue;
  }

  if (props.type === "radio" && props.defaultChecked) {
    if (props.value !== undefined) {
      return props.value as TValue;
    }

    return convertToStateValue(String(props.defaultValue ?? ""), props.type) as TValue;
  }

  if (
    props.type !== "file" &&
    props.type !== "checkbox" &&
    props.type !== "radio" &&
    props.defaultValue !== undefined
  ) {
    const defaultValue = Array.isArray(props.defaultValue)
      ? props.defaultValue.map(String)
      : String(props.defaultValue);
    return parse(defaultValue);
  }

  return stateValue;
}
