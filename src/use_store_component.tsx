import {
  useCallback,
  useRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { Store } from "gw-store";
import {
  useStoreInputWithName,
  type StoreInputWithNameProps,
} from "./use_store_input_with_name";

type StoreElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

type ElementAttributes<TElement extends StoreElement> =
  TElement extends HTMLInputElement
    ? InputHTMLAttributes<HTMLInputElement>
    : TElement extends HTMLSelectElement
      ? SelectHTMLAttributes<HTMLSelectElement>
      : TextareaHTMLAttributes<HTMLTextAreaElement>;

export type StoreInputWithNameComponentProps<
  TElement extends StoreElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = StoreInputWithNameProps<TElement, TState, TName, TValue> &
  Omit<
    ElementAttributes<TElement>,
    keyof StoreInputWithNameProps<TElement, TState, TName, TValue>
  >;

export function useStoreComponent<TState extends object>(store: Store<TState>) {
  const input = useCallback(
    function Component<TName extends keyof TState | undefined, TValue>(
      props: StoreInputWithNameComponentProps<
        HTMLInputElement,
        TState,
        TName,
        TValue
      >,
    ) {
      return <Input store={store} {...props} />;
    },
    [store],
  );

  const select = useCallback(
    function Component<TName extends keyof TState | undefined, TValue>(
      props: StoreInputWithNameComponentProps<
        HTMLSelectElement,
        TState,
        TName,
        TValue
      >,
    ) {
      return <Select store={store} {...props} />;
    },
    [store],
  );

  const textarea = useCallback(
    function Component<TName extends keyof TState | undefined, TValue>(
      props: StoreInputWithNameComponentProps<
        HTMLTextAreaElement,
        TState,
        TName,
        TValue
      >,
    ) {
      return <Textarea store={store} {...props} />;
    },
    [store],
  );

  return { input, select, textarea };
}

export type StoreComponentPropsWithStore<
  TElement extends StoreElement,
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
> = StoreInputWithNameComponentProps<TElement, TState, TName, TValue> & {
  store: Store<TState>;
};

export function Input<
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
>({
  store,
  getter,
  setter,
  toInputValue,
  toStateValue,
  ...props
}: StoreComponentPropsWithStore<HTMLInputElement, TState, TName, TValue>) {
  const ref = useRef<HTMLInputElement | null>(null);
  const storeProps = useStoreInputWithName(
    ref,
    store,
    {
      ...props,
      getter,
      setter,
      toInputValue,
      toStateValue,
    } as StoreInputWithNameProps<HTMLInputElement, TState, TName, TValue>,
  );

  return <input ref={ref} {...props} {...storeProps} />;
}

export function Select<
  TState extends object,
  TName extends keyof TState | undefined,
  TValue,
>({
  store,
  getter,
  setter,
  toInputValue,
  toStateValue,
  ...props
}: StoreComponentPropsWithStore<HTMLSelectElement, TState, TName, TValue>) {
  const ref = useRef<HTMLSelectElement | null>(null);
  const storeProps = useStoreInputWithName(
    ref,
    store,
    {
      ...props,
      getter,
      setter,
      toInputValue,
      toStateValue,
    } as StoreInputWithNameProps<HTMLSelectElement, TState, TName, TValue>,
  );

  return <select ref={ref} {...props} {...storeProps} />;
}

export function Textarea<
  TState extends object,
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
  const storeProps = useStoreInputWithName(
    ref,
    store,
    {
      ...props,
      getter,
      setter,
      toInputValue,
      toStateValue,
    } as StoreInputWithNameProps<HTMLTextAreaElement, TState, TName, TValue>,
  );

  return <textarea ref={ref} {...props} {...storeProps} />;
}
