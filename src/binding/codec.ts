import type { Result } from "gw-result";

export type Codec<TValue, TInput, TError = never> = {
  format: (value: TValue) => TInput;
  parse: (input: TInput) => Result<TValue, TError>;
  equals?: (previous: TValue, next: TValue) => boolean;
};

export function defineCodec<TValue, TInput, TError = never>(
  codec: Codec<TValue, TInput, TError>,
) {
  return codec;
}
