import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Immutable } from "immer";
import type { Result } from "gw-result";
import type { Store } from "gw-store";
import type { InputBinding } from "./binding";

export type StoreBindingMeta<TError> = { valid: true; error?: never } | { valid: false; error: TError };

export type StoreBindingOptions<TValue, TInput> = {
  onStoreChange?: (input: TInput, value: TValue) => void;
};

export type StoreBindingResult<TValue, TInput, TError> = {
  initialValue: TInput;
  meta: StoreBindingMeta<TError>;
  commit: (input: TInput) => Result<TValue, TError>;
  reset: (value: TValue) => void;
};

function equalStoreValue(previous: unknown, next: unknown) {
  if (Object.is(previous, next)) {
    return true;
  }

  if (previous instanceof Date && next instanceof Date) {
    return Object.is(previous.getTime(), next.getTime());
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    return previous.length === next.length && previous.every((value, index) => Object.is(value, next[index]));
  }

  return false;
}

export function useStoreBinding<TState extends object, TValue, TInput, TError>(
  store: Store<TState>,
  binding: InputBinding<TState, TValue, TInput, TError>,
  options: StoreBindingOptions<TValue, TInput> = {},
): StoreBindingResult<TValue, TInput, TError> {
  const dispatchKey = useId();
  const [initialValue] = useState(() => binding.codec.format(binding.lens.get(store.state)));
  const [meta, setMeta] = useState<StoreBindingMeta<TError>>({ valid: true });
  const metaRef = useRef<StoreBindingMeta<TError>>(meta);
  const optionsRef = useRef(options);
  const subscribedStoreRef = useRef<Store<TState> | null>(null);
  const subscribedBindingRef = useRef(binding);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const isReplacement =
      subscribedStoreRef.current !== null &&
      (subscribedStoreRef.current !== store || subscribedBindingRef.current !== binding);

    subscribedStoreRef.current = store;
    subscribedBindingRef.current = binding;

    const sync = (state: Immutable<TState>) => {
      if (!metaRef.current.valid) {
        return;
      }

      const value = binding.lens.get(state);
      optionsRef.current.onStoreChange?.(binding.codec.format(value), value);
    };

    const unsubscribe = store.subscribe((state, key) => {
      if (key !== dispatchKey) {
        sync(state);
      }
    });

    if (isReplacement) {
      sync(store.state);
    }

    return unsubscribe;
  }, [binding, dispatchKey, store]);

  const setValue = useCallback(
    (value: TValue) => {
      const currentValue = binding.lens.get(store.state);
      const equals = binding.codec.equals ?? equalStoreValue;

      if (equals(currentValue, value)) {
        return;
      }

      store.dispatch((state) => binding.lens.set(state, value), { key: dispatchKey });
    },
    [binding, dispatchKey, store],
  );

  const commit = useCallback(
    (input: TInput) => {
      const result = binding.codec.parse(input);

      if (result.isErr) {
        const invalidMeta: StoreBindingMeta<TError> = {
          valid: false,
          error: result.error,
        };
        metaRef.current = invalidMeta;
        setMeta(invalidMeta);
        return result;
      }

      const validMeta: StoreBindingMeta<TError> = { valid: true };
      metaRef.current = validMeta;
      setMeta((current) => (current.valid ? current : validMeta));
      setValue(result.value);
      return result;
    },
    [binding, setValue],
  );

  const reset = useCallback(
    (value: TValue) => {
      const validMeta: StoreBindingMeta<TError> = { valid: true };
      metaRef.current = validMeta;
      setMeta((current) => (current.valid ? current : validMeta));
      setValue(value);
    },
    [setValue],
  );

  return {
    initialValue,
    meta,
    commit,
    reset,
  };
}
