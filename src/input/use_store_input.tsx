import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type RefObject,
} from "react";
import type { Draft } from "immer";
import type { Store } from "gw-store";
import { useStoreController } from "../store/use_store_controller";
import {
  equalStateValue,
  readElementValue,
  writeElementValue,
} from "./dom_value";
import { isFormResetting, registerResetBinding } from "./reset_coordinator";
import {
  convertToChecked,
  convertToInputValue,
  convertToStateValue,
  resolveDefaultChecked,
  resolveDefaultValue,
  resolveResetStateValue,
} from "./value_conversion";
import type {
  InputDisplayValue,
  StoreInputProps,
} from "./types";

export type { InputDisplayValue, InputStateValue, StoreInputProps } from "./types";

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
  const inputType = props.type;
  const inputValue = props.value;
  const getStateValue = props.getter;
  const setStoreValue = props.setter;
  const mapToInputValue = props.toInputValue;

  const toInputValue = useCallback(
    (value: TValue): InputDisplayValue => {
      return convertToInputValue(value, inputType, mapToInputValue);
    },
    [inputType, mapToInputValue],
  );

  const toInputChecked = useCallback(
    (value: unknown) => {
      return convertToChecked(value, inputType, inputValue);
    },
    [inputType, inputValue],
  );

  const resetValueRef = useRef(
    resolveResetStateValue(props, props.getter(store.state)),
  );

  const setStateValue = useCallback(
    (state: Draft<TState>, value: TValue) => {
      if (equalStateValue(getStateValue(store.state), value)) {
        return;
      }

      setStoreValue(state, value);
    },
    [getStateValue, setStoreValue, store],
  );

  const { dispatch } = useStoreController(store, {
    onSubscribe: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if (element.form && isFormResetting(element.form)) {
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

      writeElementValue(element, toInputValue(props.getter(state)));
    },
    onDispatch: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      if ("files" in element && props.type === "file") {
        setStateValue(
          state,
          (element.files?.length ? element.files : null) as TValue,
        );
        return;
      }

      if ("checked" in element && props.type === "checkbox") {
        setStateValue(state, element.checked as TValue);
        return;
      }

      if ("checked" in element && props.type === "radio") {
        if (!element.checked) {
          return;
        }

        const value =
          props.value === undefined
            ? convertToStateValue(element.value, props.type)
            : props.value;
        setStateValue(state, value as TValue);
        return;
      }

      const inputValue = readElementValue(element);
      const stateValue = props.toStateValue
        ? props.toStateValue(inputValue)
        : convertToStateValue(inputValue, props.type);
      setStateValue(state, stateValue as TValue);
    },
  });

  useEffect(() => {
    const element = ref.current;
    const form = element?.form;

    if (!element || !form) {
      return;
    }

    return registerResetBinding(form, store.batch, () => {
      if (!element.isConnected) {
        return;
      }

      const resetValue = resetValueRef.current;
      const writeResetValue = () => {
        if (
          "checked" in element &&
          (props.type === "checkbox" || props.type === "radio")
        ) {
          element.checked = toInputChecked(resetValue);
        } else if (!("files" in element && props.type === "file")) {
          writeElementValue(element, toInputValue(resetValue));
        }
      };

      writeResetValue();
      store.dispatch((state) => setStateValue(state, resetValue));

      // Reassert after renderers that apply native reset defaults late.
      setTimeout(() => {
        if (element.isConnected) {
          writeResetValue();
        }
      }, 0);
    });
  }, [
    props.type,
    ref,
    setStateValue,
    store,
    store.batch,
    toInputChecked,
    toInputValue,
  ]);

  return {
    defaultValue: resolveDefaultValue(
      props,
      props.getter(store.state),
      toInputValue,
    ),
    defaultChecked: resolveDefaultChecked(
      props,
      props.getter(store.state),
      toInputChecked,
    ),
    onChange: (event: ChangeEvent<TInputElement>) => {
      dispatch();
      props.onChange?.(event);
    },
  };
}
