import { produce, type Immutable } from "immer";
import type { Codec } from "./codec";
import type { Lens } from "./lens";

type Equality<TValue> = (previous: TValue, next: TValue) => boolean;

function structuralEqual(previous: unknown, next: unknown): boolean {
  if (Object.is(previous, next)) {
    return true;
  }

  if (previous instanceof Date && next instanceof Date) {
    return previous.getTime() === next.getTime();
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    return previous.length === next.length && previous.every((value, index) => structuralEqual(value, next[index]));
  }

  if (previous !== null && next !== null && typeof previous === "object" && typeof next === "object") {
    const previousRecord = previous as Record<PropertyKey, unknown>;
    const nextRecord = next as Record<PropertyKey, unknown>;
    const previousKeys = Reflect.ownKeys(previousRecord);
    const nextKeys = Reflect.ownKeys(nextRecord);

    return (
      previousKeys.length === nextKeys.length &&
      previousKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(nextRecord, key) &&
          structuralEqual(previousRecord[key], nextRecord[key]),
      )
    );
  }

  return false;
}

export function assertLensLaws<TState extends object, TValue>(
  lens: Lens<TState, TValue>,
  options: {
    state: TState;
    values: readonly TValue[];
    equalsState?: Equality<TState>;
    equalsValue?: Equality<TValue>;
  },
) {
  const equalsState = options.equalsState ?? structuralEqual;
  const equalsValue = options.equalsValue ?? structuralEqual;
  const set = (state: TState, value: TValue) => produce(state, (draft) => lens.set(draft, value)) as TState;

  if (!equalsState(set(options.state, lens.get(options.state as Immutable<TState>)), options.state)) {
    throw new Error("Lens law failed: setting the current value changed state.");
  }

  for (const value of options.values) {
    const updated = set(options.state, value);

    if (!equalsValue(lens.get(updated as Immutable<TState>), value)) {
      throw new Error("Lens law failed: get(set(state, value)) !== value.");
    }
  }

  for (const previous of options.values) {
    for (const next of options.values) {
      if (!equalsState(set(set(options.state, previous), next), set(options.state, next))) {
        throw new Error("Lens law failed: the last set did not win.");
      }
    }
  }
}

export function assertCodecLaws<TValue, TInput, TError>(
  codec: Codec<TValue, TInput, TError>,
  options: {
    values: readonly TValue[];
    inputs?: readonly TInput[];
    equals?: Equality<TValue>;
    equalsInput?: Equality<TInput>;
  },
) {
  const equals = options.equals ?? codec.equals ?? structuralEqual;
  const equalsInput = options.equalsInput ?? structuralEqual;

  for (const value of options.values) {
    const result = codec.parse(codec.format(value));

    if (result.isErr) {
      throw new Error("Codec law failed: parse(format(value)) returned Err.");
    }

    if (!equals(result.value, value)) {
      throw new Error("Codec law failed: parse(format(value)) !== value.");
    }
  }

  for (const input of options.inputs ?? []) {
    const result = codec.parse(input);

    if (result.isOk && !equalsInput(codec.format(result.value), input)) {
      throw new Error("Codec law failed: format(parse(input).value) !== input.");
    }
  }
}
