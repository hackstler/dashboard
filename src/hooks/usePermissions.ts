import { useCallback } from "react";
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

  const can = useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role],
  );

  const canView = useCallback(
    (view: ActiveView) => canAccessView(role, view),
    [role],
  );

  const scopeOf = useCallback(
    (permission: Permission) => getPermissionScope(role, permission),
    [role],
  );

  return { can, canView, scopeOf, role };
}
