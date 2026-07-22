import { useStore, type Store } from "gw-store";
import {
  createRenderWithStore,
  type CreateRender,
} from "../store/create_render";
import { useStoreComponent } from "./store_components";

export type FormStore<TState extends object> = Store<TState> &
  ReturnType<typeof useStoreComponent<TState>> & {
    render: CreateRender<TState>;
  };

export function useFormStore<TState extends object>(
  initialState: TState,
): FormStore<TState> {
  const store = useStore<TState>(initialState);
  const storeComponent = useStoreComponent<TState>(store);

  return {
    get state() {
      return store.state;
    },
    dispatch: store.dispatch,
    batch: store.batch,
    subscribe: store.subscribe,
    render: createRenderWithStore<TState>(store),
    ...storeComponent,
  };
}
