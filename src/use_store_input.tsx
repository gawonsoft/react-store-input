import type { HTMLInputTypeAttribute, RefObject } from "react";
import type { Store } from "gw-store";
import { format } from "date-fns";
import { useStoreController } from "./use_store_controller";

export type StoreInputProps<TInputElement, TState, TValue> = {
  type?: HTMLInputTypeAttribute;
  defaultValue?: string | number | readonly string[] | undefined;
  value?: string | number | readonly string[] | undefined;
  defaultChecked?: boolean | undefined;
  onChange?: (event: React.ChangeEvent<TInputElement>) => void;
} & {
  getter: (state: TState) => TValue;
  setter: (state: TState, value: TValue) => void;
  toInputValue?: (value: TValue) => string;
  toStateValue?: (value: string) => TValue;
};

export function useStoreInput<
  TInputElement extends
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
  TState,
  TValue,
>(
  ref: RefObject<TInputElement | null>,
  store: Store<TState>,
  props: StoreInputProps<TInputElement, TState, TValue>,
) {
  const toInputValue: (value: TValue) => string =
    props.toInputValue ||
    ((value: TValue) => {
      if (value === undefined || value === null) {
        return "";
      }

      if (props.type === "datetime-local") {
        const date = new Date(value as never);

        if (!isNaN(date.getTime())) {
          return format(date, "yyyy-MM-dd'T'HH:mm:ss");
        }
      }

      return String(value);
    });

  const getDefaultValue = () => {
    if (props.defaultValue !== undefined) {
      return props.defaultValue;
    }

    if (props.type === "checkbox" || props.type === "radio") {
      return undefined;
    }

    return toInputValue(props.getter(store.state));
  };

  const toInputChecked = (value: unknown) => {
    if (props.type === "radio") {
      return value !== undefined && value === props.value;
    }

    return Boolean(value);
  };

  const getDefaultChecked = () => {
    if (props.defaultChecked) {
      return props.defaultChecked;
    }

    if (props.type !== "checkbox" && props.type !== "radio") {
      return undefined;
    }

    return toInputChecked(props.getter(store.state));
  };

  const toStateValue: (value: string) => unknown =
    props.toStateValue ||
    ((value: string) => {
      if (props.type === "number" || props.type === "range") {
        return Number(value);
      }

      if (props.type === "datetime-local") {
        return new Date(value);
      }

      return value;
    });

  const inputProps = useStoreController(store, {
    onSubscribe: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if (
        "checked" in element &&
        (props.type === "checkbox" || props.type === "radio")
      ) {
        const checked = toInputChecked(props.getter(state));

        if (element.checked === checked) {
          return;
        }

        element.checked = checked;
      } else {
        const value = toInputValue(props.getter(state));

        if (element.value === value) {
          return;
        }

        element.value = value;
      }

      const event = new Event("input", { bubbles: true });

      element.dispatchEvent(event);
    },
    onDispatch: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if ("checked" in element && props.type === "checkbox") {
        props.setter(state, element.checked as TValue);
      } else {
        props.setter(state, toStateValue(element.value) as TValue);
      }
    },
  });

  return {
    defaultValue: getDefaultValue(),
    defaultChecked: getDefaultChecked(),
    onChange: (event: React.ChangeEvent<TInputElement>) => {
      inputProps.dispatch();

      props.onChange?.(event);
    },
  };
}
