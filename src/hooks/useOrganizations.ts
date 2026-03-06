import { useState, useEffect, useCallback } from "react";
import {
  listOrganizations,
  createOrganization,
  deleteOrganization,
  getOrganization,
  updateOrganization,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from "../api/admin";
import type { AdminUser, Organization, OrganizationDetail } from "../types";

interface UseOrganizationsReturn {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createOrganization: (data: CreateOrganizationData) => Promise<{ orgId: string; admin: AdminUser }>;
  deleteOrganization: (orgId: string) => Promise<void>;
  getOrganization: (orgId: string) => Promise<OrganizationDetail>;
  updateOrganization: (orgId: string, data: UpdateOrganizationData) => Promise<OrganizationDetail>;
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
    async (data: CreateOrganizationData) => {
      const result = await createOrganization(data);
      setOrganizations((prev) => [
        ...prev,
        {
          orgId: result.orgId,
          name: data.name ?? null,
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

  const fetchOrganization = useCallback(async (orgId: string) => {
    return getOrganization(orgId);
  }, []);

  const editOrganization = useCallback(
    async (orgId: string, data: UpdateOrganizationData) => {
      return updateOrganization(orgId, data);
    },
    []
  );

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
    createOrganization: addOrganization,
    deleteOrganization: removeOrganization,
    getOrganization: fetchOrganization,
    updateOrganization: editOrganization,
  };
}
