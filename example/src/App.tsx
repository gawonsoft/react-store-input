import { useEffect, useState } from "react";
import { useFormStore } from "react-store-input";
import { Hero } from "./components/Hero";
import { StatePanel } from "./components/StatePanel";
import { Toolbar } from "./components/Toolbar";
import { INITIAL_STATE } from "./demo/state";
import { ChoicesSection } from "./sections/ChoicesSection";
import { CustomBindingsSection } from "./sections/CustomBindingsSection";
import { EditorSection } from "./sections/EditorSection";
import { LongFormSection } from "./sections/LongFormSection";
import { NumbersDatesSection } from "./sections/NumbersDatesSection";
import { TextInputsSection } from "./sections/TextInputsSection";

export default function App() {
  const store = useFormStore(INITIAL_STATE);
  const [notificationCount, setNotificationCount] = useState(0);
  const [submittedAt, setSubmittedAt] = useState<string>();

  useEffect(
    () => store.subscribe(() => setNotificationCount((count) => count + 1)),
    [store],
  );

  const applyPreset = () => {
    store.batch(() => {
      store.dispatch({
        fullName: "Grace Hopper",
        email: "grace@example.com",
        role: "admin",
        department: "research",
        interests: ["typescript", "accessibility"],
        accentColor: "#e85d75",
      });
      store.dispatch((state) => {
        state.profile.nickname = "amazing-grace";
        state.revision += 1;
      });
    });
  };

  return (
    <main className="app-shell">
      <Hero notificationCount={notificationCount} />

      <form
        className="demo-layout"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedAt(new Date().toLocaleTimeString());
        }}
      >
        <div className="catalog">
          <Toolbar
            submittedAt={submittedAt}
            onApplyPreset={applyPreset}
          />

          <store.input name="formId" type="hidden" />
          <TextInputsSection store={store} />
          <NumbersDatesSection store={store} />
          <ChoicesSection store={store} />
          <LongFormSection store={store} />
          <CustomBindingsSection store={store} />
          <EditorSection store={store} />
        </div>

        <StatePanel store={store} notificationCount={notificationCount} />
      </form>
    </main>
  );
}
