import { useApp } from "../context/AppContext";
import type { ActiveView } from "../types";
import {
  HomeIcon,
  MessageCircleIcon,
  UploadIcon,
  DatabaseIcon,
  LogOutIcon,
} from "./ui/Icons";
import type { ReactNode } from "react";

interface NavItem {
  id: ActiveView;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <HomeIcon size={18} /> },
  {
    id: "whatsapp",
    label: "Channels",
    icon: <MessageCircleIcon size={18} />,
  },
  { id: "knowledge-upload", label: "Upload", icon: <UploadIcon size={18} /> },
  {
    id: "knowledge-list",
    label: "Knowledge Base",
    icon: <DatabaseIcon size={18} />,
  },
];

interface SidebarProps {
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ onLogout, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, activeView, setActiveView } = useApp();

  const handleNav = (view: ActiveView) => {
    setActiveView(view);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 glass border-r border-border flex flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Gradient accent line at top */}
        <div className="gradient-bar h-[2px] shrink-0" />

        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-md)] flex items-center justify-center shadow-[var(--shadow-glow-accent)]">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-semibold text-sm text-text-bright tracking-tight">
              Agent Dashboard
            </span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {navItems.map((item, i) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`animate-slide-in-left stagger-${i + 1} w-full flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-accent-dim text-accent font-medium shadow-[var(--shadow-nav-active)]"
                    : "text-text-muted hover:bg-surface-hover hover:text-text hover:translate-x-0.5"
                }`}
              >
                <span className={`shrink-0 transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-brand/20 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent select-none">
            {user?.username?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-bright font-medium truncate">
              {user?.username}
            </p>
            <p className="text-xs text-text-dim truncate font-mono">
              {user?.orgId}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="btn-press text-text-dim hover:text-red transition-colors cursor-pointer p-1.5 rounded-[var(--radius-sm)] hover:bg-red-muted"
            title="Logout"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
