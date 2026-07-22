import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  wide = false,
  children,
}: {
  label: string;
  hint: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`field${wide ? " field-wide" : ""}`}>
      <span className="field-label">
        <strong>{label}</strong>
        <code>{hint}</code>
      </span>
      {children}
    </div>
  );
}
