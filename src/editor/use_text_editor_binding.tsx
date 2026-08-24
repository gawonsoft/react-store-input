import type { Ref } from "react";
import { useImperativeHandle, useMemo, useRef } from "react";
import type { TextEditorController } from "gw-rich-text-editor";
import { ok } from "gw-result";
import type { Store } from "gw-store";
import { defineBinding } from "../binding/binding";
import { defineCodec } from "../binding/codec";
import { stateLens } from "../binding/lens";
import { useStoreBinding } from "../binding/use_store_binding";

export function useTextEditorBinding<TState extends object>({
  store,
  name,
  ref,
}: {
  store: Store<TState>;
  name: keyof TState;
  ref?: Ref<TextEditorController>;
}) {
  const controllerRef = useRef<TextEditorController>(null);

  useImperativeHandle(
    ref,
    () => controllerRef.current as TextEditorController,
    [],
  );

  const binding = useMemo(() => {
    type TValue = TState[typeof name];

    return defineBinding({
      lens: stateLens<TState>().prop(name),
      codec: defineCodec<TValue, string>({
        format: (value) => (typeof value === "string" ? value : ""),
        parse: (value) => ok(value as TValue),
      }),
    });
  }, [name]);

  const storeBinding = useStoreBinding(store, binding, {
    onStoreChange: (value) => {
      const controller = controllerRef.current;

      if (controller && controller.value !== value) {
        controller.value = value;
      }
    },
  });

  return { controllerRef, ...storeBinding };
}
