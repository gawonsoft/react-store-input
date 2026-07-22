import { createRender, type FormStore } from "react-store-input";
import { CurrencyInput } from "../components/CurrencyInput";
import { Field } from "../components/Field";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function NumbersDatesSection({ store }: { store: FormStore<DemoState> }) {
  return (
    <Section
      number="02"
      title="Numbers and dates"
      description="Built-in conversion produces numbers, Date instances, or undefined for empty values."
    >
      <Field label="Number" hint="number | undefined">
        <store.input name="quantity" type="number" min={0} max={20} />
      </Field>
      <Field label="Custom currency input" hint="useStoreInput">
        <CurrencyInput store={store} />
      </Field>
      <Field label="Range" hint="number" wide>
        <div className="range-row">
          <store.input name="satisfaction" type="range" min={0} max={100} />
          {store.render((state) => (
            <output>{state.satisfaction}%</output>
          ))}
        </div>
      </Field>
      <Field label="Date" hint="string">
        <store.input name="startDate" type="date" />
      </Field>
      <Field label="Time" hint="string">
        <store.input name="appointmentTime" type="time" />
      </Field>
      <Field label="Date and time" hint="Date | undefined">
        <store.input name="meetingAt" type="datetime-local" />
      </Field>
      <Field label="Month" hint="string">
        <store.input name="billingMonth" type="month" />
      </Field>
      <Field label="Week" hint="string">
        <store.input name="sprintWeek" type="week" />
      </Field>
      <Field label="Color" hint="string">
        <div className="color-row">
          <store.input name="accentColor" type="color" />
          {createRender(store, (state) => (
            <code>{state.accentColor}</code>
          ))}
        </div>
      </Field>
    </Section>
  );
}
