import type { Draft, Immutable } from "immer";

export type Lens<TState extends object, TValue> = {
  get: (state: Immutable<TState>) => TValue;
  set: (state: Draft<TState>, value: TValue) => void;
};

export type LensBuilder<TState extends object, TValue> = Lens<TState, TValue> &
  (TValue extends object
    ? {
        prop<TKey extends keyof TValue>(key: TKey): LensBuilder<TState, TValue[TKey]>;
      }
    : object);

export type StateLens<TState extends object> = {
  prop<TKey extends keyof TState>(key: TKey): LensBuilder<TState, TState[TKey]>;
};

export function defineLens<TState extends object, TValue>(lens: Lens<TState, TValue>) {
  return lens;
}

function readPath(value: unknown, path: readonly PropertyKey[]) {
  return path.reduce<unknown>((current, key) => (current as Record<PropertyKey, unknown>)[key], value);
}

function writePath(state: unknown, path: readonly PropertyKey[], value: unknown) {
  const parent = path
    .slice(0, -1)
    .reduce<
      Record<PropertyKey, unknown>
    >((current, key) => current[key] as Record<PropertyKey, unknown>, state as Record<PropertyKey, unknown>);
  parent[path.at(-1) as PropertyKey] = value;
}

function createPathLens<TState extends object, TValue>(path: readonly PropertyKey[]): LensBuilder<TState, TValue> {
  return {
    get: (state: Immutable<TState>) => readPath(state, path) as TValue,
    set: (state: Draft<TState>, value: TValue) => writePath(state, path, value),
    prop: (key: PropertyKey) => createPathLens([...path, key]),
  } as unknown as LensBuilder<TState, TValue>;
}

export function stateLens<TState extends object>(): StateLens<TState> {
  return {
    prop: (key) => createPathLens<TState, TState[typeof key]>([key]),
  };
}
