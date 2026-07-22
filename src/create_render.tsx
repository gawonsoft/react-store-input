import type { Immutable } from "immer";
import { useSelector, type EqualityFn, type Store } from "gw-store";
import type { ReactNode } from "react";

export type CreateRender<TState extends object> = (
  selector: (state: Immutable<TState>) => ReactNode,
  compare?: EqualityFn<Immutable<TState>>,
) => ReactNode;

export function createRender<TState extends object>(
  store: Store<TState>,
  selector: (state: Immutable<TState>) => ReactNode,
  compare?: EqualityFn<Immutable<TState>>,
) {
  function Component() {
    const result = useSelector(store, (state) => state, compare);

    const content = selector(result);

    return <>{content}</>;
  }

  return <Component />;
}

export function createRenderWithStore<TState extends object>(
  store: Store<TState>,
): CreateRender<TState> {
  return function createRender(selector, compare) {
    function Component() {
      const result = useSelector(store, (state) => state, compare);

      const content = selector(result);

      return <>{content}</>;
    }

    return <Component />;
  };
}
