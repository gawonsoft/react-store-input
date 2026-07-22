import type { InputDisplayValue, InputStateValue } from "./types";

type StoreElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateTimeLocal(value: unknown) {
  const date = new Date(value as string | number | Date);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
}

export function readElementValue(element: StoreElement): InputStateValue {
  if ("options" in element && element.multiple) {
    return Array.from(element.selectedOptions, (option) => option.value);
  }

  return element.value;
}

export function writeElementValue(
  element: StoreElement,
  value: InputDisplayValue,
) {
  if ("files" in element && element.type === "file") {
    return;
  }

  if ("options" in element && element.multiple) {
    const selectedValues = new Set(
      (Array.isArray(value) ? value : [value]).map(String),
    );

    for (const option of element.options) {
      const selected = selectedValues.has(option.value);

      if (option.selected !== selected) {
        option.selected = selected;
      }
    }

    return;
  }

  const nextValue = String(value);

  if (element.value !== nextValue) {
    element.value = nextValue;
  }
}

export function equalStateValue(previous: unknown, next: unknown) {
  if (Object.is(previous, next)) {
    return true;
  }

  if (previous instanceof Date && next instanceof Date) {
    return Object.is(previous.getTime(), next.getTime());
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    return (
      previous.length === next.length &&
      previous.every((value, index) => Object.is(value, next[index]))
    );
  }

  return false;
}
