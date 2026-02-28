import type { Toast as ToastType } from "../../hooks/useToast";
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from "./Icons";

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  info: InfoIcon,
};

const colorMap = {
  success: "border-green/20 shadow-[var(--shadow-toast-success)]",
  error: "border-red/20 shadow-[var(--shadow-toast-error)]",
  info: "border-accent/20 shadow-[var(--shadow-toast-info)]",
};

const iconColorMap = {
  success: "text-green",
  error: "text-red",
  info: "text-accent",
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const IconComp = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 glass border rounded-[var(--radius-md)] animate-toast-in ${colorMap[toast.type]}`}
          >
            <IconComp size={16} className={`shrink-0 ${iconColorMap[toast.type]}`} />
            <p className="text-xs text-text flex-1">{toast.message}</p>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-text-dim hover:text-text-muted transition-colors cursor-pointer shrink-0"
            >
              <XIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
