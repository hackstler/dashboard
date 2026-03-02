import { useState, useEffect, useCallback } from "react";
import { listUsers, createUser, deleteUser } from "../api/admin";
import type { CreateUserData, InviteUserData } from "../api/admin";
import type { AdminUser } from "../types";

interface UseUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createUser: (data: CreateUserData | InviteUserData) => Promise<AdminUser>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUsers(filters: {
  orgId?: string;
  search?: string;
} = {}): UseUsersReturn {
  const { orgId, search } = filters;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f: { orgId?: string; search?: string } = {};
      if (orgId?.trim()) f.orgId = orgId.trim();
      if (search?.trim()) f.search = search.trim();
      const data = await listUsers(f);
      setUsers(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [orgId, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(
    async (data: CreateUserData | InviteUserData) => {
      const created = await createUser(data);
      setUsers((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const removeUser = useCallback(async (id: string) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser: addUser,
    deleteUser: removeUser,
  };
}
