import type { FormStore } from "react-store-input";
import { Field } from "../components/Field";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function TextInputsSection({ store }: { store: FormStore<DemoState> }) {
  return (
    <Section
      number="01"
      title="Text inputs"
      description="Text, email, password, search, telephone, and URL retain native browser behavior."
    >
      <Field label="Text" hint="string">
        <store.input name="fullName" type="text" autoComplete="name" />
      </Field>
      <Field label="Email" hint="string">
        <store.input name="email" type="email" autoComplete="email" />
      </Field>
      <Field label="Password" hint="string">
        <store.input
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </Field>
      <Field label="Search" hint="string">
        <store.input name="search" type="search" />
      </Field>
      <Field label="Telephone" hint="string">
        <store.input name="phone" type="tel" />
      </Field>
      <Field label="URL" hint="string">
        <store.input name="website" type="url" />
      </Field>
    </Section>
  );
}
