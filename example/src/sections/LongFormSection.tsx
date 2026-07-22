import { Textarea, type FormStore } from "react-store-input";
import { Field } from "../components/Field";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function LongFormSection({ store }: { store: FormStore<DemoState> }) {
  return (
    <Section
      number="04"
      title="Long-form and files"
      description="Textarea attributes are typed correctly, while file inputs expose FileList or null."
    >
      <Field label="Store textarea" hint="store.textarea" wide>
        <store.textarea name="bio" rows={4} />
      </Field>
      <Field label="Standalone textarea" hint="Textarea" wide>
        <Textarea store={store} name="notes" rows={4} wrap="soft" />
      </Field>
      <Field label="File" hint="FileList | null" wide>
        <store.input name="attachment" type="file" />
      </Field>
    </Section>
  );
}
