import {
  TextEditor as GwTextEditor,
  TextEditorController,
  type TextEditorProps as GwTextEditorProps,
} from "gw-rich-text-editor";
import { ok } from "gw-result";
import { useImperativeHandle, useMemo, useRef } from "react";
import type { Store } from "gw-store";
import { defineBinding } from "../binding/binding";
import { defineCodec } from "../binding/codec";
import { stateLens } from "../binding/lens";
import { useStoreBinding } from "../binding/use_store_binding";

export type TextEditorProps<TState extends object> = Omit<GwTextEditorProps, "name"> & {
  store: Store<TState>;
  name: keyof TState;
};

export function TextEditor<TState extends object>({
  store,
  name,
  defaultValue,
  ref,
  ...props
}: TextEditorProps<TState>) {
  const controllerRef = useRef<TextEditorController>(null);

  useImperativeHandle(ref, () => controllerRef.current as TextEditorController, []);

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

  const { commit, initialValue } = useStoreBinding(store, binding, {
    onStoreChange: (value) => {
      const controller = controllerRef.current;

      if (controller && controller.value !== value) {
        controller.value = value;
      }
    },
  });

  return (
    <GwTextEditor
      {...props}
      ref={controllerRef}
      name={String(name)}
      defaultValue={defaultValue ?? initialValue}
      onChange={(value) => {
        commit(value);
        props.onChange?.(value);
      }}
    />
  );
}
