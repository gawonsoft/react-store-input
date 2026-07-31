import { useRef } from "react";
import {
  defineBinding,
  defineCodec,
  ok,
  stateLens,
  useStoreHTMLElement,
} from "react-store-input";
import type { Store } from "gw-store";
import type { DemoState } from "../demo/state";

const nicknameBinding = defineBinding({
  lens: stateLens<DemoState>().prop("profile").prop("nickname"),
  codec: defineCodec<string, string>({
    format: (value) => value,
    parse: ok,
  }),
});

export function NicknameInput({ store }: { store: Store<DemoState> }) {
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps } = useStoreHTMLElement(ref, store, nicknameBinding);

  return <input ref={ref} {...inputProps} />;
}
