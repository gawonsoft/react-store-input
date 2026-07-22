import {
  useEffect,
  type ChangeEvent,
  type HTMLInputTypeAttribute,
  type RefObject,
} from "react";
import type { Draft, Immutable } from "immer";
import type { Store } from "gw-store";
import { useStoreController } from "./use_store_controller";

export type InputDisplayValue = string | number | readonly string[];
export type InputStateValue = string | string[];

// A native form reset updates every control at once. While each binding copies
// its reset value back to the store, sibling subscriptions must not restore
// their previous store values into the DOM.
const resettingForms = new WeakSet<HTMLFormElement>();

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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLocal(value: unknown) {
  const date = new Date(value as string | number | Date);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
}

function readElementValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): InputStateValue {
  if ("options" in element && element.multiple) {
    return Array.from(element.selectedOptions, (option) => option.value);
  }

  return element.value;
}

function writeElementValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: InputDisplayValue,
) {
  if ("files" in element && element.type === "file") {
    return;
  }

  if ("options" in element && element.multiple) {
    const selectedValues = new Set(
      (Array.isArray(value) ? value : [value]).map(String),
    );

    for (const option of element.options) {
      const selected = selectedValues.has(option.value);

      if (option.selected !== selected) {
        option.selected = selected;
      }
    }

    return;
  }

  const nextValue = String(value);

  if (element.value !== nextValue) {
    element.value = nextValue;
  }
}

export function useStoreInput<
  TInputElement extends
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
  TState extends object,
  TValue,
>(
  ref: RefObject<TInputElement | null>,
  store: Store<TState>,
  props: StoreInputProps<TInputElement, TState, TValue>,
) {
  const toInputValue = (value: TValue): InputDisplayValue => {
    if (props.toInputValue) {
      return props.toInputValue(value);
    }

    if (value === undefined || value === null) {
      return "";
    }

    if (props.type === "datetime-local") {
      return formatDateTimeLocal(value);
    }

    if (Array.isArray(value)) {
      return value.map(String);
    }

    return String(value);
  };

  const toInputChecked = (value: unknown) => {
    if (props.type === "radio") {
      return value !== undefined && Object.is(value, props.value);
    }

    return Boolean(value);
  };

  const getDefaultValue = () => {
    if (props.type !== "radio" && props.value !== undefined) {
      return undefined;
    }

    if (props.defaultValue !== undefined) {
      return props.defaultValue;
    }

    if (
      props.type === "checkbox" ||
      props.type === "radio" ||
      props.type === "file"
    ) {
      return undefined;
    }

    return toInputValue(props.getter(store.state));
  };

  const getDefaultChecked = () => {
    if (props.checked !== undefined) {
      return undefined;
    }

    if (props.defaultChecked !== undefined) {
      return props.defaultChecked;
    }

    if (props.type !== "checkbox" && props.type !== "radio") {
      return undefined;
    }

    return toInputChecked(props.getter(store.state));
  };

  const defaultToStateValue = (value: InputStateValue): unknown => {
    if (Array.isArray(value)) {
      return value;
    }

    if (props.type === "number" || props.type === "range") {
      return value === "" ? undefined : Number(value);
    }

    if (props.type === "datetime-local") {
      if (value === "") {
        return undefined;
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    return value;
  };

  const { dispatch } = useStoreController(store, {
    onSubscribe: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if (element.form && resettingForms.has(element.form)) {
        return;
      }

      if (
        "checked" in element &&
        (props.type === "checkbox" || props.type === "radio")
      ) {
        if (props.checked !== undefined) {
          return;
        }

        const checked = toInputChecked(props.getter(state));

        if (element.checked !== checked) {
          element.checked = checked;
        }

        return;
      }

      if (props.type !== "radio" && props.value !== undefined) {
        return;
      }

      if ("files" in element && props.type === "file") {
        return;
      }

      const value = toInputValue(props.getter(state));
      writeElementValue(element, value);
    },
    onDispatch: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if ("files" in element && props.type === "file") {
        props.setter(state, element.files as TValue);
        return;
      }

      if ("checked" in element && props.type === "checkbox") {
        props.setter(state, element.checked as TValue);
        return;
      }

      if ("checked" in element && props.type === "radio") {
        if (!element.checked) {
          return;
        }

        const value =
          props.value === undefined
            ? defaultToStateValue(element.value)
            : props.value;
        props.setter(state, value as TValue);
        return;
      }

      const inputValue = readElementValue(element);
      const stateValue = props.toStateValue
        ? props.toStateValue(inputValue)
        : defaultToStateValue(inputValue);
      props.setter(state, stateValue as TValue);
    },
  });

  useEffect(() => {
    const element = ref.current;
    const form = element?.form;

    if (!element || !form) {
      return;
    }

    const handleReset = () => {
      resettingForms.add(form);

      setTimeout(() => {
        try {
          if (element.isConnected) {
            dispatch();
          }
        } finally {
          // Every reset listener queues its dispatch in the first timer layer,
          // so cleanup in the second layer runs after all controls. A timer is
          // used instead of a microtask because browsers may apply the native
          // reset default action after the reset event's microtask checkpoint.
          setTimeout(() => resettingForms.delete(form), 0);
        }
      }, 0);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [dispatch, ref]);

  return {
    defaultValue: getDefaultValue(),
    defaultChecked: getDefaultChecked(),
    onChange: (event: ChangeEvent<TInputElement>) => {
      dispatch();
      props.onChange?.(event);
    },
  };
}
