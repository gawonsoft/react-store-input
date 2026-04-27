import { useCallback, useRef, type DetailedHTMLProps } from "react";
import type { Store } from "./use_store";
import {
  useStoreInputWithName,
  type StoreInputWithNameProps,
} from "./use_store_input_with_name";
import { TextEditor, type TextEditorProps } from "./text_editor";

export type StoreInputWithNameComponentProps<
  TElement,
  TState,
  TName extends keyof TState | undefined,
  TValue,
> = StoreInputWithNameProps<TElement, TState, TName, TValue> &
  Omit<
    DetailedHTMLProps<React.InputHTMLAttributes<TElement>, TElement>,
    keyof StoreInputWithNameProps<TElement, TState, TName, TValue>
  >;

export function useStoreComponent<TState>(store: Store<TState>) {
  const input = useCallback(function Component<
    TName extends keyof TState | undefined,
    TValue,
  >(
    props: StoreInputWithNameComponentProps<
      HTMLInputElement,
      TState,
      TName,
      TValue
    >,
  ) {
    return <Input store={store} {...props} />;
  }, []);

  const select = useCallback(function Component<
    TName extends keyof TState | undefined,
    TValue,
  >(
    props: StoreInputWithNameComponentProps<
      HTMLSelectElement,
      TState,
      TName,
      TValue
    >,
  ) {
    return <Select store={store} {...props} />;
  }, []);

  const textarea = useCallback(function Component<
    TName extends keyof TState | undefined,
    TValue,
  >(
    props: StoreInputWithNameComponentProps<
      HTMLTextAreaElement,
      TState,
      TName,
      TValue
    >,
  ) {
    return <Textarea store={store} {...props} />;
  }, []);

  const textEditor = useCallback(function Component(
    props: Omit<TextEditorProps<TState>, "store">,
  ) {
    return <TextEditor store={store} {...props} />;
  }, []);

  return {
    input,
    select,
    textarea,
    textEditor,
  };
}

export type StoreComponentPropsWithStore<
  TElement extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  TState,
  TName extends keyof TState | undefined,
  TValue,
> = StoreInputWithNameComponentProps<TElement, TState, TName, TValue> & {
  store: Store<TState>;
};

export function Input<TState, TName extends keyof TState | undefined, TValue>({
  store,
  getter,
  setter,
  toInputValue,
  toStateValue,
  ...props
}: StoreComponentPropsWithStore<HTMLInputElement, TState, TName, TValue>) {
  const ref = useRef<HTMLInputElement | null>(null);

  const storeProps = useStoreInputWithName(ref, store, {
    ...props,
    getter,
    setter,
    toInputValue,
    toStateValue,
  });

  return <input ref={ref} {...props} {...storeProps} />;
}

export function Select<TState, TName extends keyof TState | undefined, TValue>({
  store,
  getter,
  setter,
  toInputValue,
  toStateValue,
  ...props
}: StoreComponentPropsWithStore<HTMLSelectElement, TState, TName, TValue>) {
  const ref = useRef<HTMLSelectElement | null>(null);

  const storeProps = useStoreInputWithName(ref, store, {
    ...props,
    getter,
    setter,
    toInputValue,
    toStateValue,
  });

  return <select ref={ref} {...props} {...storeProps} />;
}

export function Textarea<
  TState,
  TName extends keyof TState | undefined,
  TValue,
>({
  store,
  getter,
  setter,
  toInputValue,
  toStateValue,
  ...props
}: StoreComponentPropsWithStore<HTMLTextAreaElement, TState, TName, TValue>) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const storeProps = useStoreInputWithName(ref, store, {
    ...props,
    getter,
    setter,
    toInputValue,
    toStateValue,
  });

  return <textarea ref={ref} {...props} {...storeProps} />;
}
