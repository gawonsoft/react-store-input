import { Input, type FormStore } from "react-store-input";
import { Field } from "../components/Field";
import { RevisionController } from "../components/RevisionController";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function CustomBindingsSection({
  store,
}: {
  store: FormStore<DemoState>;
}) {
  return (
    <Section
      number="05"
      title="Custom bindings"
      description="Bind nested state or build non-input controllers without giving up immutable updates."
    >
      <Field label="Standalone Input" hint="Input component">
        <Input store={store} name="displayName" />
      </Field>
      <Field label="Nested nickname" hint="getter + setter">
        <store.input
          getter={(state) => state.profile.nickname}
          setter={(state, value) => {
            state.profile.nickname = value;
          }}
        />
      </Field>
      <Field label="Custom controller" hint="useStoreController" wide>
        <RevisionController store={store} />
      </Field>
    </Section>
  );
}
