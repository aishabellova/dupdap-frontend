import React, { useId } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** When set, renders a live character counter (current/max) below the input. */
  showCounter?: boolean;
}

export function FormField({ label, id, showCounter, maxLength, value, ...props }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const currentLength = typeof value === 'string' ? value.length : 0;
  const showCount = showCounter && typeof maxLength === 'number';

  return (
    <div>
      <label className="label" htmlFor={inputId}>{label}</label>
      <input id={inputId} className="input" maxLength={maxLength} value={value} {...props} />
      {showCount && (
        <p className="mt-1 text-right text-xs text-gray-500">
          {currentLength}/{maxLength}
        </p>
      )}
    </div>
  );
}
