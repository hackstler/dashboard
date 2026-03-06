import { useApp } from "../context/AppContext";
import { hasPermission, getPermissionScope, type Permission, type Role } from "../permissions";

export function usePermissions() {
  const { user } = useApp();
  const role = (user?.role ?? "user") as Role;
  return {
    can: (permission: Permission) => hasPermission(role, permission),
    scopeOf: (permission: Permission) => getPermissionScope(role, permission),
    role,
  };
}
