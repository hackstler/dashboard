import { useState, useEffect, useCallback } from "react";
import {
  listOrganizations,
  createOrganization,
  deleteOrganization,
} from "../api/admin";
import type { AdminUser, Organization } from "../types";

interface UseOrganizationsReturn {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createOrganization: (data: {
    orgId: string;
    adminUsername: string;
    adminPassword: string;
  }) => Promise<{ orgId: string; admin: AdminUser }>;
  deleteOrganization: (orgId: string) => Promise<void>;
}

export function useOrganizations(): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrganizations();
      setOrganizations(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load organizations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const addOrganization = useCallback(
    async (data: {
      orgId: string;
      adminUsername: string;
      adminPassword: string;
    }) => {
      const result = await createOrganization(data);
      setOrganizations((prev) => [
        ...prev,
        {
          orgId: result.orgId,
          userCount: 1,
          docCount: 0,
          createdAt: result.admin.createdAt,
        },
      ]);
      return result;
    },
    []
  );

  const removeOrganization = useCallback(async (orgId: string) => {
    await deleteOrganization(orgId);
    setOrganizations((prev) => prev.filter((o) => o.orgId !== orgId));
  }, []);

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
    createOrganization: addOrganization,
    deleteOrganization: removeOrganization,
  };
}
