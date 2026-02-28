import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-text-dim mb-4">{icon}</div>
      <h3 className="text-sm font-semibold text-text-bright mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
