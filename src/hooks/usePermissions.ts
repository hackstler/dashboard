import { useApp } from "../context/AppContext";
import {
  hasPermission,
  getPermissionScope,
  canAccessView,
  type Permission,
  type Role,
} from "../permissions";
import type { ActiveView } from "../types";

export function usePermissions() {
  const { user } = useApp();
  const role = (user?.role ?? "user") as Role;
  return {
    can: (permission: Permission) => hasPermission(role, permission),
    canView: (view: ActiveView) => canAccessView(role, view),
    scopeOf: (permission: Permission) => getPermissionScope(role, permission),
    role,
  };
}
