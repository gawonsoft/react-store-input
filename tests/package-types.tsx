import {
  Input,
  Textarea,
  defineBinding,
  defineCodec,
  createRender,
  err,
  ok,
  stateLens,
  useFormStore,
  useSelector,
  useStore,
  useStoreInput,
} from "react-store-input";
import { TextEditor } from "react-store-input/text-editor";
import { useRef } from "react";
// @ts-expect-error StoreInputProps was removed in 0.4.0.
import type { StoreInputProps } from "react-store-input";

function TypeExample() {
  const store = useStore({
    email: "",
    count: 0 as number | undefined,
    profile: { nickname: "" },
  });
  const form = useFormStore({ content: "" });

  const email = useSelector(store, (state) => state.email);
  const nicknameBinding = defineBinding({
    lens: stateLens<typeof store.state>().prop("profile").prop("nickname"),
    codec: defineCodec({
      format: (value: string) => value,
      parse: (value: string) =>
        value.length > 0 ? ok(value) : err("EMPTY_NICKNAME" as const),
    }),
  });
  const nicknameRef = useRef<HTMLInputElement>(null);
  const nicknameField = useStoreInput(nicknameRef, store, nicknameBinding);
  // @ts-expect-error Legacy mapping objects are no longer accepted.
  useStoreInput(nicknameRef, store, {});
  const nicknameError = nicknameField.meta.valid
    ? undefined
    : nicknameField.meta.error;
  createRender(store, (state) => <span>{state.email}</span>);

  return (
    <>
      <Input store={store} name="email" type="email" />
      <Input store={store} name="count" type="number" />
      <Textarea store={store} name="email" rows={4} wrap="soft" />
      <TextEditor store={form} name="content" />
      <input
        ref={nicknameRef}
        {...nicknameField.inputProps}
        aria-invalid={!nicknameField.meta.valid}
      />
      <span>{email}</span>
      <span>{nicknameError}</span>
      {/* @ts-expect-error Named components require a state key. */}
      <Input store={store} />
      {/* @ts-expect-error Legacy converter props were removed in 0.4.0. */}
      <Input store={store} name="email" toInputValue={(value) => value} />
      {/* @ts-expect-error Store snapshots are immutable. */}
      <button onClick={() => (store.state.email = "invalid")}>invalid</button>
    </>
  );
}

const numberCodec = defineCodec({
  format: (value: number) => String(value),
  parse: (input: string) => ok(Number(input)),
});
const nicknameLens = stateLens<{
  profile: { nickname: string };
}>().prop("profile").prop("nickname");

// @ts-expect-error The lens and codec must use the same domain value type.
defineBinding({ lens: nicknameLens, codec: numberCodec });

void TypeExample;
void (undefined as unknown as StoreInputProps);
