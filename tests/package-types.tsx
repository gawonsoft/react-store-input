import {
  Input,
  Textarea,
  createRender,
  useFormStore,
  useSelector,
  useStore,
} from "react-store-input";
import { TextEditor } from "react-store-input/text-editor";

function TypeExample() {
  const store = useStore({
    email: "",
    count: 0 as number | undefined,
    profile: { nickname: "" },
  });
  const form = useFormStore({ content: "" });

  const email = useSelector(store, (state) => state.email);
  createRender(store, (state) => <span>{state.email}</span>);

  return (
    <>
      <Input store={store} name="email" type="email" />
      <Input store={store} name="count" type="number" />
      <Textarea store={store} name="email" rows={4} wrap="soft" />
      <Input
        store={store}
        getter={(state) => state.profile.nickname}
        setter={(state, value) => {
          state.profile.nickname = value;
        }}
      />
      <TextEditor store={form} name="content" />
      <span>{email}</span>
      {/* @ts-expect-error A name or a getter/setter pair is required. */}
      <Input store={store} />
      {/* @ts-expect-error Store snapshots are immutable. */}
      <button onClick={() => (store.state.email = "invalid")}>invalid</button>
    </>
  );
}

void TypeExample;
