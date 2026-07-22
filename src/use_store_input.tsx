import {
  useCallback,
  useEffect,
  useRef,
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

type ResetBatch = (callback: () => void) => unknown;

type ResetCoordinator = {
  groups: Map<ResetBatch, Set<() => void>>;
  handleReset: () => void;
};

const resetCoordinators = new WeakMap<HTMLFormElement, ResetCoordinator>();

function registerResetBinding(
  form: HTMLFormElement,
  batch: ResetBatch,
  dispatch: () => void,
) {
  let coordinator = resetCoordinators.get(form);

  if (!coordinator) {
    const groups = new Map<ResetBatch, Set<() => void>>();
    const handleReset = () => {
      resettingForms.add(form);

      // Capture the current bindings because a React reset handler may render
      // and re-register them before the native reset default action completes.
      const groupSnapshots = Array.from(groups, ([groupBatch, bindings]) => [
        groupBatch,
        [...bindings],
      ] as const);

      setTimeout(() => {
        try {
          for (const [groupBatch, bindings] of groupSnapshots) {
            groupBatch(() => {
              for (const binding of bindings) {
                binding();
              }
            });
          }
        } finally {
          // Store notifications are synchronous, so subscriptions have already
          // observed the completed batch before the reset guard is released.
          setTimeout(() => resettingForms.delete(form), 0);
        }
      }, 0);
    };

    coordinator = { groups, handleReset };
    resetCoordinators.set(form, coordinator);
    form.addEventListener("reset", handleReset);
  }

  let bindings = coordinator.groups.get(batch);

  if (!bindings) {
    bindings = new Set();
    coordinator.groups.set(batch, bindings);
  }

  bindings.add(dispatch);

  return () => {
    const currentCoordinator = resetCoordinators.get(form);

    if (!currentCoordinator) {
      return;
    }

    const currentBindings = currentCoordinator.groups.get(batch);
    currentBindings?.delete(dispatch);

    if (currentBindings?.size === 0) {
      currentCoordinator.groups.delete(batch);
    }

    if (currentCoordinator.groups.size === 0) {
      form.removeEventListener("reset", currentCoordinator.handleReset);
      resetCoordinators.delete(form);
    }
  };
}

function equalStateValue(previous: unknown, next: unknown) {
  if (Object.is(previous, next)) {
    return true;
  }

  if (previous instanceof Date && next instanceof Date) {
    return Object.is(previous.getTime(), next.getTime());
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    return (
      previous.length === next.length &&
      previous.every((value, index) => Object.is(value, next[index]))
    );
  }

  return false;
}

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
  const inputType = props.type;
  const inputValue = props.value;
  const getStateValue = props.getter;
  const setStoreValue = props.setter;
  const mapToInputValue = props.toInputValue;

  const toInputValue = useCallback((value: TValue): InputDisplayValue => {
    if (mapToInputValue) {
      return mapToInputValue(value);
    }

    if (value === undefined || value === null) {
      return "";
    }

    if (inputType === "datetime-local") {
      return formatDateTimeLocal(value);
    }

    if (Array.isArray(value)) {
      return value.map(String);
    }

    return String(value);
  }, [inputType, mapToInputValue]);

  const toInputChecked = useCallback((value: unknown) => {
    if (inputType === "radio") {
      return value !== undefined && Object.is(value, inputValue);
    }

    return Boolean(value);
  }, [inputType, inputValue]);

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

  const getResetStateValue = (): TValue => {
    if (props.type === "checkbox" && props.defaultChecked !== undefined) {
      return props.defaultChecked as TValue;
    }

    if (props.type === "radio" && props.defaultChecked) {
      if (props.value !== undefined) {
        return props.value as TValue;
      }

      const defaultValue = props.defaultValue ?? "";
      return defaultToStateValue(String(defaultValue)) as TValue;
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
      return (props.toStateValue
        ? props.toStateValue(defaultValue)
        : defaultToStateValue(defaultValue)) as TValue;
    }

    return props.getter(store.state);
  };

  const resetValueRef = useRef(getResetStateValue());

  const setStateValue = useCallback((state: Draft<TState>, value: TValue) => {
    if (equalStateValue(getStateValue(store.state), value)) {
      return;
    }

    setStoreValue(state, value);
  }, [getStateValue, setStoreValue, store]);

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
        // A cleared or reset file input exposes an empty FileList. Store null
        // instead so the state returns to the same serializable empty value
        // used by a typical initial form state.
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
            ? defaultToStateValue(element.value)
            : props.value;
        setStateValue(state, value as TValue);
        return;
      }

      const inputValue = readElementValue(element);
      const stateValue = props.toStateValue
        ? props.toStateValue(inputValue)
        : defaultToStateValue(inputValue);
      setStateValue(state, stateValue as TValue);
    },
  });

  useEffect(() => {
    const element = ref.current;
    const form = element?.form;

    if (!element || !form) {
      return;
    }

    // A timer is used by the shared coordinator because browsers may apply the
    // native reset default action after the reset event's microtask checkpoint.
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

      // Some renderers apply the native reset default after the first reset
      // task. Reassert the captured default after that action without another
      // store dispatch, notably for React-managed multiple selects.
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
    defaultValue: getDefaultValue(),
    defaultChecked: getDefaultChecked(),
    onChange: (event: ChangeEvent<TInputElement>) => {
      dispatch();
      props.onChange?.(event);
    },
  };
}
