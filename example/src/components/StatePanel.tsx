import { useSelector, type Store } from "react-store-input";
import type { DemoState } from "../demo/state";

export function StatePanel({
  store,
  notificationCount,
}: {
  store: Store<DemoState>;
  notificationCount: number;
}) {
  const state = useSelector(store, (snapshot) => snapshot);
  const serializedState = JSON.stringify(
    state,
    (_key, value) => {
      if (typeof FileList !== "undefined" && value instanceof FileList) {
        return Array.from(value, (file) => ({
          name: file.name,
          size: file.size,
        }));
      }

      return value;
    },
    2,
  );

  return (
    <aside className="state-panel">
      <div className="state-heading">
        <div>
          <p className="eyebrow">useSelector</p>
          <h2>Live state</h2>
        </div>
        <span>{notificationCount}</span>
      </div>
      <pre>{serializedState}</pre>
      <p className="state-footnote">
        Date values serialize as ISO strings. Files display their name and size.
      </p>
    </aside>
  );
}
