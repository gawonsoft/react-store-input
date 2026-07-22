import {
  useSelector,
  useStoreController,
  type Store,
} from "react-store-input";
import type { DemoState } from "../demo/state";

export function RevisionController({ store }: { store: Store<DemoState> }) {
  const revision = useSelector(store, (state) => state.revision);
  const { dispatch } = useStoreController(store, {
    onSubscribe: () => {},
    onDispatch: (state) => {
      state.revision += 1;
    },
  });

  return (
    <button type="button" className="revision-button" onClick={dispatch}>
      <span>Revision {revision}</span>
      <strong>Increment through controller</strong>
    </button>
  );
}
