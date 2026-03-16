import { useEffect } from "react";
import type { Store, StoreSubscriber } from "./use_store";

export function useSubscribe<T>(
  store: Store<T>,
  subscriber: StoreSubscriber<T>,
) {
  useEffect(() => {
    const unsubscribe = store.subscribe(subscriber);

    return () => {
      unsubscribe();
    };
  }, []);
}
