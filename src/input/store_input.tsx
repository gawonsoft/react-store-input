import {
  useCallback,
  useRef,
  type ReactElement,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { Store } from "gw-store";
import { useStoreInputWithName, type StoreInputWithNameProps } from "../html_element/use_store_input_with_name";

type StoreElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type ElementAttributes<TElement extends StoreElement> = TElement extends HTMLInputElement
  ? InputHTMLAttributes<HTMLInputElement>
  : TElement extends HTMLSelectElement
    ? SelectHTMLAttributes<HTMLSelectElement>
    : TextareaHTMLAttributes<HTMLTextAreaElement>;

export type StoreInputWithNameComponentProps<
  TElement extends StoreElement,
  TState extends object,
  TName extends keyof TState,
> = StoreInputWithNameProps<TElement, TState, TName> &
  Omit<ElementAttributes<TElement>, keyof StoreInputWithNameProps<TElement, TState, TName>>;

export type StoreComponentPropsWithStore<
  TElement extends StoreElement,
  TState extends object,
  TName extends keyof TState,
> = StoreInputWithNameComponentProps<TElement, TState, TName> & {
  store: Store<TState>;
};

export type StoreComponents<TState extends object> = {
  input: <TName extends keyof TState>(
    props: StoreInputWithNameComponentProps<HTMLInputElement, TState, TName>,
  ) => ReactElement | null;
  select: <TName extends keyof TState>(
    props: StoreInputWithNameComponentProps<HTMLSelectElement, TState, TName>,
  ) => ReactElement | null;
  textarea: <TName extends keyof TState>(
    props: StoreInputWithNameComponentProps<HTMLTextAreaElement, TState, TName>,
  ) => ReactElement | null;
};

export function Input<TState extends object, TName extends keyof TState>({
  store,
  ...props
}: StoreComponentPropsWithStore<HTMLInputElement, TState, TName>) {
  const ref = useRef<HTMLInputElement | null>(null);
  const storeProps = useStoreInputWithName(ref, store, props);

  return <input ref={ref} {...props} {...storeProps} />;
}

export function Select<TState extends object, TName extends keyof TState>({
  store,
  ...props
}: StoreComponentPropsWithStore<HTMLSelectElement, TState, TName>) {
  const ref = useRef<HTMLSelectElement | null>(null);
  const storeProps = useStoreInputWithName(ref, store, props);

  return <select ref={ref} {...props} {...storeProps} />;
}

export function Textarea<TState extends object, TName extends keyof TState>({
  store,
  ...props
}: StoreComponentPropsWithStore<HTMLTextAreaElement, TState, TName>) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const storeProps = useStoreInputWithName(ref, store, props);

  return <textarea ref={ref} {...props} {...storeProps} />;
}

export function useStoreInput<TState extends object>(store: Store<TState>): StoreComponents<TState> {
  const input = useCallback(
    function Component<TName extends keyof TState>(
      props: StoreInputWithNameComponentProps<HTMLInputElement, TState, TName>,
    ) {
      return <Input store={store} {...props} />;
    },
    [store],
  );

  const select = useCallback(
    function Component<TName extends keyof TState>(
      props: StoreInputWithNameComponentProps<HTMLSelectElement, TState, TName>,
    ) {
      return <Select store={store} {...props} />;
    },
    [store],
  );

  const textarea = useCallback(
    function Component<TName extends keyof TState>(
      props: StoreInputWithNameComponentProps<HTMLTextAreaElement, TState, TName>,
    ) {
      return <Textarea store={store} {...props} />;
    },
    [store],
  );

  return { input, select, textarea };
}
