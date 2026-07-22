import {
  TextEditor as GwTextEditor,
  TextEditorController,
  type TextEditorProps as GwTextEditorProps,
} from "gw-react-text-editor";
import { useImperativeHandle, useRef } from "react";
import type { Draft, Immutable } from "immer";
import type { Store } from "gw-store";
import { useStoreController } from "../store/use_store_controller";

export type TextEditorProps<TState extends object> = Omit<
  GwTextEditorProps,
  "name"
> & {
  store: Store<TState>;
  name?: keyof TState;
  getter?: (state: Immutable<TState>) => string;
  setter?: (state: Draft<TState>, value: string) => void;
};

export function TextEditor<TState extends object>({
  store,
  name,
  getter,
  setter,
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

      const result = getter
        ? getter(state) || ""
        : name === undefined
          ? ""
          : (state[name as never] as unknown as string) || "";

      if (controller.value !== result) {
        controller.value = result;
      }
    },
    onDispatch: (state) => {
      const controller = controllerRef.current;

      if (!controller) {
        return;
      }

      if (setter) {
        setter(state, controller.value);
      } else if (name !== undefined) {
        state[name as never] = controller.value as unknown as never;
      }
    },
  });

  const getDefaultValue = () => {
    if (getter) {
      return getter(store.state);
    }

    return name === undefined
      ? undefined
      : (store.state[name as never] as unknown as string);
  };

  return (
    <GwTextEditor
      {...props}
      ref={controllerRef}
      name={name === undefined ? undefined : String(name)}
      defaultValue={defaultValue ?? getDefaultValue()}
      onChange={(event) => {
        dispatch();
        props.onChange?.(event);
      }}
    />
  );
}
