import {
  RichTextEditor as GwRichTextEditor,
  TextEditor as GwTextEditor,
  type RichTextEditorProps as GwRichTextEditorProps,
  type TextEditorProps as GwTextEditorProps,
} from "gw-rich-text-editor";
import type { Store } from "gw-store";
import { useTextEditorBinding } from "./use_text_editor_binding";

export type TextEditorProps<TState extends object> = Omit<
  GwTextEditorProps,
  "name"
> & {
  store: Store<TState>;
  name: keyof TState;
};

export type RichTextEditorProps<TState extends object> = Omit<
  GwRichTextEditorProps,
  "name"
> & {
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
  const { controllerRef, initialValue, commit } = useTextEditorBinding({
    store,
    name,
    ref,
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

export function RichTextEditor<TState extends object>({
  store,
  name,
  defaultValue,
  ref,
  ...props
}: RichTextEditorProps<TState>) {
  const { controllerRef, initialValue, commit } = useTextEditorBinding({
    store,
    name,
    ref,
  });

  return (
    <GwRichTextEditor
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
