import { useEffect, useState } from "react";
import {
  storeService,
  type Store as StoreEntity,
  type Warehouse as WarehouseEntity,
} from "@/lib/services/store-service";

export interface UseStoresOptions {
  triggerToast: (msg: string) => void;
  /** Chỉ fetch khi đã đăng nhập (page.tsx truyền isAuthenticated). */
  isAuthenticated: boolean;
}

/**
 * State cửa hàng & kho (TASK-004, TASK-012 tách từ page.tsx):
 * danh sách cửa hàng/kho từ API, điểm bán POS đang chọn, form thêm chi nhánh.
 */
export function useStores({ triggerToast, isAuthenticated }: UseStoresOptions) {
  const [stores, setStores] = useState<StoreEntity[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseEntity[]>([]);
  const [isStoresLoading, setIsStoresLoading] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [addStoreError, setAddStoreError] = useState<string | null>(null);
  const [newStoreForm, setNewStoreForm] = useState({
    name: "",
    code: "",
    address: "",
    phoneNumber: "",
    defaultWarehouseId: "",
  });

  // Điểm bán POS đang chọn — mặc định cửa hàng đầu tiên khi tải xong.
  const [posStore, setPosStore] = useState<string>("store-001-q1");

  const fetchStoresAndWarehouses = async () => {
    setIsStoresLoading(true);
    try {
      const [stData, whData] = await Promise.all([
        storeService.getStores(),
        storeService.getWarehouses(),
      ]);

      const enrichedStores = stData.map((st, idx) => ({
        ...st,
        todayRevenue: st.todayRevenue ?? (idx === 0 ? 15400000 : idx === 1 ? 9800000 : 4200000),
        ordersCount: st.ordersCount ?? (idx === 0 ? 12 : idx === 1 ? 8 : 4),
        cashiers: st.cashiers ?? ["Nhân viên trực ca"],
      }));

      setStores(enrichedStores);
      setWarehouses(whData);
      if (whData.length > 0) {
        setNewStoreForm((prev) => ({
          ...prev,
          defaultWarehouseId: prev.defaultWarehouseId || whData[0].id,
        }));
      }
      if (enrichedStores.length > 0 && !enrichedStores.some((s) => s.id === posStore)) {
        setPosStore(enrichedStores[0].id);
      }
    } catch (err: unknown) {
      console.error("Không thể tải danh sách cửa hàng & kho:", err);
    } finally {
      setIsStoresLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStoresAndWarehouses();
    }
    // Chỉ fetch lại khi trạng thái đăng nhập đổi (như bản gốc).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ---------------------------------------------------------------------------
  // CREATE STORE ACTION (TASK-004)
  // ---------------------------------------------------------------------------
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreError(null);
    if (!newStoreForm.name.trim() || !newStoreForm.code.trim() || !newStoreForm.address.trim()) {
      setAddStoreError("Vui lòng điền đầy đủ Tên, Mã cửa hàng và Địa chỉ");
      return;
    }

    setIsSubmittingStore(true);
    try {
      await storeService.createStore({
        name: newStoreForm.name.trim(),
        code: newStoreForm.code.trim().toUpperCase(),
        address: newStoreForm.address.trim(),
        phoneNumber: newStoreForm.phoneNumber.trim() || undefined,
        defaultWarehouseId: newStoreForm.defaultWarehouseId || undefined,
      });

      triggerToast(`Đã thêm chi nhánh mới: ${newStoreForm.name}`);
      setShowAddStoreModal(false);
      setNewStoreForm({
        name: "",
        code: "",
        address: "",
        phoneNumber: "",
        defaultWarehouseId: warehouses[0]?.id || "",
      });
      await fetchStoresAndWarehouses();
    } catch (err: unknown) {
      setAddStoreError(err instanceof Error ? err.message : "Không thể tạo cửa hàng. Vui lòng kiểm tra lại!");
    } finally {
      setIsSubmittingStore(false);
    }
  };

  return {
    stores,
    warehouses,
    isStoresLoading,
    showAddStoreModal,
    setShowAddStoreModal,
    isSubmittingStore,
    addStoreError,
    setAddStoreError,
    newStoreForm,
    setNewStoreForm,
    posStore,
    setPosStore,
    fetchStoresAndWarehouses,
    handleCreateStore,
  };
}

export type StoresApi = ReturnType<typeof useStores>;
