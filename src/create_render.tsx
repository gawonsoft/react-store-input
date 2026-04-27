import type { Store } from "gw-store";
import { useSelector } from "gw-store";
import type { ReactNode } from "react";

export type CreateRender<TState> = (
  selector: (state: TState) => ReactNode,
  compare?: (a: TState, b: TState) => boolean,
) => ReactNode;

export function createRender<TState>(
  store: Store<TState>,
  selector: (state: TState) => ReactNode,
  compare?: (a: TState, b: TState) => boolean,
) {
  function Component() {
    const result = useSelector(store, (state) => state, compare);

    const content = selector(result);

    return <>{content}</>;
  }

  return <Component />;
}

export function createRenderWithStore<TState>(
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
