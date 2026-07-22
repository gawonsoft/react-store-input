import {
  TextEditor as GwTextEditor,
  TextEditorController,
  type TextEditorProps as GwTextEditorProps,
} from "gw-react-text-editor";
import { useImperativeHandle, useRef } from "react";
import type { Store } from "gw-store";
import { useStoreController } from "../store/use_store_controller";

export type TextEditorProps<TState extends object> = Omit<
  GwTextEditorProps,
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
  const controllerRef = useRef<TextEditorController>(null);

  useImperativeHandle(
    ref,
    () => controllerRef.current as TextEditorController,
    [],
  );

  const { dispatch } = useStoreController<TState>(store, {
    onSubscribe: (state) => {
      const controller = controllerRef.current;

      if (!controller) {
        return;
      }

      const result = (state[name as never] as unknown as string) || "";

      if (controller.value !== result) {
        controller.value = result;
      }
    },
    onDispatch: (state) => {
      const controller = controllerRef.current;

      if (!controller) {
        return;
      }

      state[name as never] = controller.value as unknown as never;
    },
  });

  const getDefaultValue = () =>
    store.state[name as never] as unknown as string;

  return (
    <GwTextEditor
      {...props}
      ref={controllerRef}
      name={String(name)}
      defaultValue={defaultValue ?? getDefaultValue()}
      onChange={(event) => {
        dispatch();
        props.onChange?.(event);
      }}
    />
  );
}
