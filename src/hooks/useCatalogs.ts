import { useState, useEffect, useCallback } from "react";
import {
  listCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  activateCatalog,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  type CatalogData,
  type CatalogItemData,
  type CreateCatalogData,
  type UpdateCatalogData,
  type CreateItemData,
  type UpdateItemData,
} from "../api/catalog";

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<CatalogData[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCatalogs();
      setCatalogs(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const fetchItems = useCallback(async (catalogId: string) => {
    setItemsLoading(true);
    try {
      const data = await listItems(catalogId);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCatalogId) {
      fetchItems(selectedCatalogId);
    } else {
      setItems([]);
    }
  }, [selectedCatalogId, fetchItems]);

  const selectCatalog = useCallback((id: string | null) => {
    setSelectedCatalogId(id);
  }, []);

  const addCatalog = useCallback(async (data: CreateCatalogData) => {
    const created = await createCatalog(data);
    setCatalogs((prev) => [created, ...prev]);
    return created;
  }, []);

  const editCatalog = useCallback(async (id: string, data: UpdateCatalogData) => {
    const updated = await updateCatalog(id, data);
    setCatalogs((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeCatalog = useCallback(async (id: string) => {
    await deleteCatalog(id);
    setCatalogs((prev) => prev.filter((c) => c.id !== id));
    if (selectedCatalogId === id) {
      setSelectedCatalogId(null);
      setItems([]);
    }
  }, [selectedCatalogId]);

  const doActivateCatalog = useCallback(async (id: string) => {
    const activated = await activateCatalog(id);
    setCatalogs((prev) =>
      prev.map((c) => (c.id === id ? activated : { ...c, isActive: false })),
    );
    return activated;
  }, []);

  const addItem = useCallback(async (catalogId: string, data: CreateItemData) => {
    const created = await createItem(catalogId, data);
    setItems((prev) => [...prev, created]);
    return created;
  }, []);

  const editItem = useCallback(async (catalogId: string, itemId: string, data: UpdateItemData) => {
    const updated = await updateItem(catalogId, itemId, data);
    setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    return updated;
  }, []);

  const removeItem = useCallback(async (catalogId: string, itemId: string) => {
    await deleteItem(catalogId, itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  return {
    catalogs,
    selectedCatalogId,
    items,
    loading,
    itemsLoading,
    error,
    refetch: fetchCatalogs,
    selectCatalog,
    createCatalog: addCatalog,
    updateCatalog: editCatalog,
    deleteCatalog: removeCatalog,
    activateCatalog: doActivateCatalog,
    createItem: addItem,
    updateItem: editItem,
    deleteItem: removeItem,
  };
}
