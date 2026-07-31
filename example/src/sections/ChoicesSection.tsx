import type { Store } from "gw-store";
import { Select, type StoreComponents } from "react-store-input";
import { Field } from "../components/Field";
import { NewsletterSelect } from "../components/NewsletterSelect";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function ChoicesSection({
  store,
  controls,
}: {
  store: Store<DemoState>;
  controls: StoreComponents<DemoState>;
}) {
  return (
    <Section
      number="03"
      title="Choices and collections"
      description="Checkboxes map to booleans, radio values preserve their original type, and multiple select returns an array."
    >
      <Field label="Checkbox" hint="boolean">
        <label className="choice-card">
          <controls.input name="rememberMe" type="checkbox" />
          Remember this device
        </label>
      </Field>
      <Field label="Radio group" hint="string" wide>
        <div className="choice-grid">
          {(["admin", "editor", "viewer"] as const).map((role) => (
            <label className="choice-card" key={role}>
              <controls.input name="role" type="radio" value={role} />
              <span>{role}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Select" hint="standalone Select">
        <Select store={store} name="department">
          <option value="engineering">Engineering</option>
          <option value="research">Research</option>
          <option value="design">Design</option>
        </Select>
      </Field>
      <Field label="Boolean select" hint="custom Codec">
        <NewsletterSelect store={store} />
      </Field>
      <Field label="Multiple select" hint="string[]" wide>
        <controls.select name="interests" multiple size={4}>
          <option value="react">React</option>
          <option value="typescript">TypeScript</option>
          <option value="accessibility">Accessibility</option>
          <option value="testing">Testing</option>
        </controls.select>
      </Field>
    </Section>
  );
}
