import { useEffect, useId } from "react";
import type { Store } from "gw-store";

export type StoreControllerProps<TState> = {
  onSubscribe: (state: TState) => void;
  onDispatch: (state: TState) => void;
};

export function useStoreController<TState>(
  store: Store<TState>,
  props: StoreControllerProps<TState>,
) {
  const dispatchKey = useId();

  useEffect(() => {
    const unsub = store.subscribe((state, key) => {
      if (key === dispatchKey) {
        return;
      }

      props.onSubscribe(state);
    });

    return () => {
      unsub();
    };
  }, []);

  const dispatch = () => {
    store.dispatch(
      (state) => {
        props.onDispatch(state);
      },
      {
        key: dispatchKey,
      },
    );
  };

  return {
    dispatch,
  };
}
