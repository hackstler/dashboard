import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors placeholder:text-text-dim ${
            icon ? "pl-9" : ""
          } ${error ? "border-red/50" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
