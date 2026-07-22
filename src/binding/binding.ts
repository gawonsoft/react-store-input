import type { Codec } from "./codec";
import type { Lens } from "./lens";

export type InputBinding<
  TState extends object,
  TValue,
  TInput,
  TError = never,
> = {
  lens: Lens<TState, TValue>;
  codec: Codec<TValue, TInput, TError>;
};

export function defineBinding<
  TState extends object,
  TValue,
  TInput,
  TError = never,
>(binding: InputBinding<TState, TValue, TInput, TError>) {
  return binding;
}
