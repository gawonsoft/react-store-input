import type { Store } from "gw-store";
import { createRender, type StoreComponents } from "react-store-input";
import { CurrencyInput } from "../components/CurrencyInput";
import { Field } from "../components/Field";
import { Section } from "../components/Section";
import type { DemoState } from "../demo/state";

export function NumbersDatesSection({
  store,
  controls,
}: {
  store: Store<DemoState>;
  controls: StoreComponents<DemoState>;
}) {
  return (
    <Section
      number="02"
      title="Numbers and dates"
      description="Built-in conversion produces numbers, Date instances, or undefined for empty values."
    >
      <Field label="Number" hint="number | undefined">
        <controls.input name="quantity" type="number" min={0} max={20} />
      </Field>
      <Field label="Custom currency input" hint="Lens + Codec + Result">
        <CurrencyInput store={store} />
      </Field>
      <Field label="Range" hint="number" wide>
        <div className="range-row">
          <controls.input
            name="satisfaction"
            type="range"
            min={0}
            max={100}
          />
          {createRender(store, (state) => (
            <output>{state.satisfaction}%</output>
          ))}
        </div>
      </Field>
      <Field label="Date" hint="string">
        <controls.input name="startDate" type="date" />
      </Field>
      <Field label="Time" hint="string">
        <controls.input name="appointmentTime" type="time" />
      </Field>
      <Field label="Date and time" hint="Date | undefined">
        <controls.input name="meetingAt" type="datetime-local" />
      </Field>
      <Field label="Month" hint="string">
        <controls.input name="billingMonth" type="month" />
      </Field>
      <Field label="Week" hint="string">
        <controls.input name="sprintWeek" type="week" />
      </Field>
      <Field label="Color" hint="string">
        <div className="color-row">
          <controls.input name="accentColor" type="color" />
          {createRender(store, (state) => (
            <code>{state.accentColor}</code>
          ))}
        </div>
      </Field>
    </Section>
  );
}
