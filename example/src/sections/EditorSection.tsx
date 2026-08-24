import { lazy, Suspense, useState } from "react";
import type { Store } from "gw-store";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

const LazyRichTextEditor = lazy(() =>
  import("react-store-input/text-editor").then(({ RichTextEditor }) => ({
    default: RichTextEditor<DemoState>,
  })),
);

export function EditorSection({ store }: { store: Store<DemoState> }) {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <Section
      number="06"
      title="Optional text editor"
      description="The editor is loaded from react-store-input/text-editor only when requested, keeping the core bundle small."
    >
      <div className="editor-demo">
        {!showEditor ? (
          <button
            type="button"
            className="button secondary"
            onClick={() => setShowEditor(true)}
          >
            Load optional editor
          </button>
        ) : (
          <Suspense fallback={<p className="loading">Loading editor…</p>}>
            <LazyRichTextEditor store={store} name="content" />
          </Suspense>
        )}
      </div>
    </Section>
  );
}
