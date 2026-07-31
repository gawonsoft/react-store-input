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

const newsletterBinding = defineBinding({
  lens: stateLens<DemoState>().prop("newsletter"),
  codec: defineCodec<boolean, string>({
    format: (value) => (value ? "yes" : "no"),
    parse: (value) => ok(value === "yes"),
  }),
});

export function NewsletterSelect({ store }: { store: Store<DemoState> }) {
  const ref = useRef<HTMLSelectElement>(null);
  const { inputProps } = useStoreHTMLElement(
    ref,
    store,
    newsletterBinding,
  );

  return (
    <select ref={ref} {...inputProps}>
      <option value="yes">Subscribed</option>
      <option value="no">Not subscribed</option>
    </select>
  );
}
