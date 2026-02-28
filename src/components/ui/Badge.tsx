import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-hi text-text-muted",
  success: "bg-green-muted text-green",
  warning: "bg-yellow-muted text-yellow",
  error: "bg-red-muted text-red",
  info: "bg-accent-dim text-accent",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  success: "bg-green",
  warning: "bg-yellow",
  error: "bg-red",
  info: "bg-accent",
};

export function Badge({
  variant = "default",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
