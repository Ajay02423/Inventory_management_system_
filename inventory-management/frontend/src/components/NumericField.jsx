import { AlertTriangle } from "lucide-react";

import { getNumericHelperText } from "../utils";

export default function NumericField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  min,
  step,
  integer = false,
  error,
  helperText,
}) {
  const numericWarning = getNumericHelperText(value, { min, integer });

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        className={`field-input ${error ? "border-berry-500 ring-2 ring-berry-100 focus:border-berry-500 focus:ring-berry-100" : ""}`}
        id={id}
        name={name}
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {helperText ? <p className="mt-2 text-sm text-ink/55">{helperText}</p> : null}
      {numericWarning ? (
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-accent-700">
          <AlertTriangle className="h-4 w-4" />
          {numericWarning}
        </p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
