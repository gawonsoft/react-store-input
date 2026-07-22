import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Draft } from "immer";
import type { Store } from "gw-store";
import type { InputBinding } from "../binding/binding";
import { useStoreController } from "../store/use_store_controller";
import {
  equalStateValue,
  readElementValue,
  writeElementValue,
} from "./dom_value";
import { isFormResetting, registerResetBinding } from "./reset_coordinator";
import type {
  BindingInputResult,
  InputControlValue,
  InputDisplayValue,
  StoreInputDomProps,
  StoreInputBindingOptions,
  StoreInputMeta,
  StoreInputOptions,
} from "./types";
import { resolveDefaultChecked, resolveDefaultValue } from "./value_conversion";

export type {
  BindingInputResult,
  InputControlValue,
  InputDisplayValue,
  InputStateValue,
  StoreInputBindingOptions,
  StoreInputDomProps,
  StoreInputMeta,
  StoreInputOptions,
} from "./types";

type StoreElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

function isDisplayValue(value: InputControlValue): value is InputDisplayValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

function readControlValue(
  element: StoreElement,
  type: StoreInputOptions<StoreElement>["type"],
  radioValue: InputDisplayValue | undefined,
): InputControlValue | undefined {
  if ("files" in element && type === "file") {
    return element.files?.length ? element.files : null;
  }

  if ("checked" in element && type === "checkbox") {
    return element.checked;
  }

  if ("checked" in element && type === "radio") {
    return element.checked ? (radioValue ?? element.value) : undefined;
  }

  return readElementValue(element);
}

export function useStoreInput<
  TInputElement extends StoreElement,
  TState extends object,
  TValue,
  TInput extends InputControlValue,
  TError,
>(
  ref: RefObject<TInputElement | null>,
  store: Store<TState>,
  binding: InputBinding<TState, TValue, TInput, TError>,
  options: StoreInputBindingOptions<TInputElement, TValue> = {},
): BindingInputResult<TInputElement, TError> {
  const props: StoreInputOptions<TInputElement> = options;
  const getStateValue = binding.lens.get;
  const setStoreValue = binding.lens.set;
  const [meta, setMeta] = useState<StoreInputMeta<TError>>({ valid: true });
  const metaRef = useRef<StoreInputMeta<TError>>(meta);

  const formatValue = useCallback(
    (value: TValue): InputControlValue => binding.codec.format(value),
    [binding],
  );

  const parseValue = useCallback(
    (value: InputControlValue) => binding.codec.parse(value as TInput),
    [binding],
  );

  const toChecked = useCallback(
    (value: TValue) =>
      props.type === "radio"
        ? Object.is(formatValue(value), props.value)
        : Boolean(formatValue(value)),
    [formatValue, props.type, props.value],
  );

  const initialStateValue = getStateValue(store.state);
  const resetValueRef = useRef(
    Object.prototype.hasOwnProperty.call(options, "resetValue")
      ? (options.resetValue as TValue)
      : initialStateValue,
  );

  const setStateValue = useCallback(
    (state: Draft<TState>, value: TValue) => {
      const equals = binding.codec.equals ?? equalStateValue;

      if (equals(getStateValue(store.state), value)) {
        return;
      }

      setStoreValue(state, value);
    },
    [binding, getStateValue, setStoreValue, store],
  );

  const commitValue = useCallback(
    (state: Draft<TState>, controlValue: InputControlValue) => {
      const result = parseValue(controlValue);

      if (result.isErr) {
        const invalidMeta: StoreInputMeta<TError> = {
          valid: false,
          error: result.error,
        };
        metaRef.current = invalidMeta;
        setMeta(invalidMeta);
        return;
      }

      const validMeta: StoreInputMeta<TError> = { valid: true };
      metaRef.current = validMeta;
      setMeta((current) => (current.valid ? current : validMeta));
      setStateValue(state, result.value);
    },
    [parseValue, setStateValue],
  );

  const writeValue = useCallback(
    (element: TInputElement, value: TValue) => {
      if (
        "checked" in element &&
        (props.type === "checkbox" || props.type === "radio")
      ) {
        element.checked = toChecked(value);
        return;
      }

      if ("files" in element && props.type === "file") {
        return;
      }

      const formatted = formatValue(value);

      if (isDisplayValue(formatted)) {
        writeElementValue(element, formatted);
      }
    },
    [formatValue, props.type, toChecked],
  );

  const { dispatch } = useStoreController(store, {
    onSubscribe: (state) => {
      const element = ref.current;

      if (
        !element ||
        !metaRef.current.valid ||
        (element.form && isFormResetting(element.form)) ||
        (props.type !== "radio" && props.value !== undefined)
      ) {
        return;
      }

      if (
        "checked" in element &&
        (props.type === "checkbox" || props.type === "radio") &&
        props.checked !== undefined
      ) {
        return;
      }

      writeValue(element, getStateValue(state));
    },
    onDispatch: (state) => {
      const element = ref.current;

      if (!element) {
        return;
      }

      const controlValue = readControlValue(element, props.type, props.value);

      if (controlValue !== undefined) {
        commitValue(state, controlValue);
      }
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
      const writeResetValue = () => writeValue(element, resetValue);

      writeResetValue();
      const validMeta: StoreInputMeta<TError> = { valid: true };
      metaRef.current = validMeta;
      setMeta((current) => (current.valid ? current : validMeta));
      store.dispatch((state) => setStateValue(state, resetValue));

      setTimeout(() => {
        if (element.isConnected) {
          writeResetValue();
        }
      }, 0);
    });
  }, [ref, setStateValue, store, store.batch, writeValue]);

  const inputProps: StoreInputDomProps<TInputElement> = {
    defaultValue: resolveDefaultValue(props, initialStateValue, (value) => {
      const formatted = formatValue(value);
      return isDisplayValue(formatted) ? formatted : "";
    }),
    defaultChecked: resolveDefaultChecked(
      props,
      initialStateValue,
      toChecked,
    ),
    onChange: (event) => {
      dispatch();
      props.onChange?.(event);
    },
  };

  return { inputProps, meta };
}
