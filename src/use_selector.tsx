import { useEffect, useRef, useState } from "react";
import type { Store } from "./use_store";

export function useSelector<TState, TSelected>(
  store: Store<TState>,
  selector: (state: TState) => TSelected,
  compare: (a: TSelected, b: TSelected) => boolean = (a, b) => a === b,
): TSelected {
  const [state, setState] = useState(selector(store.state));

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const result = selector(newState);

      if (compare(stateRef.current, result)) {
        return;
      }

      setState(result);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
