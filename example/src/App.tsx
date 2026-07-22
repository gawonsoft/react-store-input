import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createRender,
  Input,
  Select,
  Textarea,
  useFormStore,
  useSelector,
  useStoreController,
  useStoreInput,
  type Store,
} from "react-store-input";

const LazyTextEditor = lazy(() =>
  import("react-store-input/text-editor").then(({ TextEditor }) => ({
    default: TextEditor<DemoState>,
  })),
);

type DemoState = {
  formId: string;
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  search: string;
  phone: string;
  website: string;
  quantity: number | undefined;
  budget: number | undefined;
  satisfaction: number;
  startDate: string;
  appointmentTime: string;
  meetingAt: Date | undefined;
  billingMonth: string;
  sprintWeek: string;
  accentColor: string;
  rememberMe: boolean;
  role: "admin" | "editor" | "viewer";
  department: string;
  newsletter: boolean;
  interests: string[];
  bio: string;
  notes: string;
  attachment: FileList | null;
  revision: number;
  profile: {
    nickname: string;
  };
  content: string;
};

const INITIAL_STATE: DemoState = {
  formId: "demo-2026",
  fullName: "Ada Lovelace",
  displayName: "ada",
  email: "ada@example.com",
  password: "analytical-engine",
  search: "immutable forms",
  phone: "+82 10-1234-5678",
  website: "https://example.com",
  quantity: 3,
  budget: 2500,
  satisfaction: 72,
  startDate: "2026-07-22",
  appointmentTime: "10:30",
  meetingAt: new Date(2026, 6, 22, 14, 30),
  billingMonth: "2026-07",
  sprintWeek: "2026-W30",
  accentColor: "#6d5dfc",
  rememberMe: true,
  role: "editor",
  department: "engineering",
  newsletter: true,
  interests: ["react", "typescript"],
  bio: "Building small tools with predictable state.",
  notes: "This textarea uses the standalone Textarea component.",
  attachment: null,
  revision: 1,
  profile: { nickname: "countess-of-code" },
  content: "<p>Optional editor content lives in the same store.</p>",
};

export default function App() {
  const store = useFormStore(INITIAL_STATE);
  const [notificationCount, setNotificationCount] = useState(0);
  const [submittedAt, setSubmittedAt] = useState<string>();
  const [showEditor, setShowEditor] = useState(false);

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
      <header className="hero">
        <div>
          <p className="eyebrow">react-store-input · interactive catalog</p>
          <h1>One store. Every form control.</h1>
          <p className="hero-copy">
            Edit any field and watch its typed value update. This page exercises
            the complete core API, native reset behavior, custom bindings, and
            the optional editor entry point.
          </p>
        </div>
        <div className="hero-stats" aria-label="Demo status">
          <span>
            <strong>{notificationCount}</strong> notifications
          </span>
          <span>
            <strong>0.2.0</strong> gw-store
          </span>
        </div>
      </header>

      <form
        className="demo-layout"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedAt(new Date().toLocaleTimeString());
        }}
      >
        <div className="catalog">
          <div className="toolbar">
            <div>
              <strong>Try the controls</strong>
              <span>Every change goes directly to the immutable store.</span>
            </div>
            <div className="toolbar-actions">
              <button type="button" className="button secondary" onClick={applyPreset}>
                Apply batch preset
              </button>
              <button type="reset" className="button ghost">
                Reset all
              </button>
              <button type="submit" className="button primary">
                Submit snapshot
              </button>
            </div>
          </div>

          {submittedAt && (
            <p className="notice" role="status">
              Snapshot submitted at {submittedAt}. Check the live state panel.
            </p>
          )}

          <store.input name="formId" type="hidden" />

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
              <store.input name="password" type="password" autoComplete="current-password" />
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

          <Section
            number="03"
            title="Choices and collections"
            description="Checkboxes map to booleans, radio values preserve their original type, and multiple select returns an array."
          >
            <Field label="Checkbox" hint="boolean">
              <label className="choice-card">
                <store.input name="rememberMe" type="checkbox" />
                Remember this device
              </label>
            </Field>
            <Field label="Radio group" hint="string" wide>
              <div className="choice-grid">
                {(["admin", "editor", "viewer"] as const).map((role) => (
                  <label className="choice-card" key={role}>
                    <store.input name="role" type="radio" value={role} />
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
            <Field label="Boolean select" hint="custom converters">
              <store.select
                name="newsletter"
                toInputValue={(value) => (value ? "yes" : "no")}
                toStateValue={(value) => value === "yes"}
              >
                <option value="yes">Subscribed</option>
                <option value="no">Not subscribed</option>
              </store.select>
            </Field>
            <Field label="Multiple select" hint="string[]" wide>
              <store.select name="interests" multiple size={4}>
                <option value="react">React</option>
                <option value="typescript">TypeScript</option>
                <option value="accessibility">Accessibility</option>
                <option value="testing">Testing</option>
              </store.select>
            </Field>
          </Section>

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
                  <LazyTextEditor store={store} name="content" />
                </Suspense>
              )}
            </div>
          </Section>
        </div>

        <StatePanel store={store} notificationCount={notificationCount} />
      </form>
    </main>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="demo-section">
      <div className="section-heading">
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="field-grid">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  wide = false,
  children,
}: {
  label: string;
  hint: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`field${wide ? " field-wide" : ""}`}>
      <span className="field-label">
        <strong>{label}</strong>
        <code>{hint}</code>
      </span>
      {children}
    </div>
  );
}

function CurrencyInput({ store }: { store: Store<DemoState> }) {
  const ref = useRef<HTMLInputElement>(null);
  const inputProps = useStoreInput(ref, store, {
    type: "number",
    getter: (state) => state.budget,
    setter: (state, value) => {
      state.budget = value;
    },
    toInputValue: (value) => value ?? "",
    toStateValue: (value) => (value === "" ? undefined : Number(value)),
  });

  return <input {...inputProps} ref={ref} type="number" step={100} />;
}

function RevisionController({ store }: { store: Store<DemoState> }) {
  const revision = useSelector(store, (state) => state.revision);
  const { dispatch } = useStoreController(store, {
    onSubscribe: () => {},
    onDispatch: (state) => {
      state.revision += 1;
    },
  });

  return (
    <button type="button" className="revision-button" onClick={dispatch}>
      <span>Revision {revision}</span>
      <strong>Increment through controller</strong>
    </button>
  );
}

function StatePanel({
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
        return Array.from(value, (file) => ({ name: file.name, size: file.size }));
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
