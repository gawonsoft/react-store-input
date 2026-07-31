import { useSelector, type Store } from "gw-store";
import type { DemoState } from "../demo/state";

export function RevisionController({ store }: { store: Store<DemoState> }) {
  const revision = useSelector(store, (state) => state.revision);
  const increment = () =>
    store.dispatch((state) => {
      state.revision += 1;
    });

  return (
    <button type="button" className="revision-button" onClick={increment}>
      <span>Revision {revision}</span>
      <strong>Increment through store dispatch</strong>
    </button>
  );
}
