import { useCallback, useEffect, useId, useRef } from "react";
import type { Draft, Immutable } from "immer";
import type { Store } from "gw-store";

export type StoreControllerProps<TState extends object> = {
  onSubscribe: (state: Immutable<TState>) => void;
  onDispatch: (state: Draft<TState>) => void;
};

export function useStoreController<TState extends object>(
  store: Store<TState>,
  props: StoreControllerProps<TState>,
) {
  const dispatchKey = useId();
  const propsRef = useRef(props);
  const subscribedStoreRef = useRef<Store<TState> | null>(null);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const isReplacement =
      subscribedStoreRef.current !== null && subscribedStoreRef.current !== store;
    subscribedStoreRef.current = store;

    const unsubscribe = store.subscribe((state, key) => {
      if (key !== dispatchKey) {
        propsRef.current.onSubscribe(state);
      }
    });

    if (isReplacement) {
      propsRef.current.onSubscribe(store.state);
    }

    return unsubscribe;
  }, [dispatchKey, store]);

  const dispatch = useCallback(() => {
    store.dispatch(
      (state) => {
        propsRef.current.onDispatch(state);
      },
      { key: dispatchKey },
    );
  }, [dispatchKey, store]);

  return { dispatch };
}
