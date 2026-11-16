import { Building2, X, AlertTriangle, Loader2, Plus } from "lucide-react";
import type { Warehouse as WarehouseEntity } from "@/lib/services/store-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export interface NewStoreForm {
  name: string;
  code: string;
  address: string;
  phoneNumber: string;
  defaultWarehouseId: string;
}

export interface AddStoreModalProps {
  form: NewStoreForm;
  setForm: (v: NewStoreForm) => void;
  warehouses: WarehouseEntity[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal 4: Them chi nhanh cua hang moi (TASK-004) — gan kho xuat mac dinh. */
export function AddStoreModal({
  form: newStoreForm,
  setForm: setNewStoreForm,
  warehouses,
  isSubmitting: isSubmittingStore,
  error: addStoreError,
  onSubmit: handleCreateStore,
  onClose,
}: AddStoreModalProps) {
  return (
    <Modal size="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Thêm Chi Nhánh Cửa Hàng Mới</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Khai báo điểm bán vật lý và gắn kho xuất hàng mặc định</p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateStore} className="py-4 space-y-4 text-xs">
          {addStoreError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{addStoreError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên Chi Nhánh / Cửa Hàng <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="Ví dụ: Cửa Hàng 3 — Chi nhánh Thủ Đức"
              value={newStoreForm.name}
              onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
              className="focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mã Chi Nhánh <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="STORE-HCM-03"
                value={newStoreForm.code}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, code: e.target.value.toUpperCase() })}
                className="uppercase font-mono focus:ring-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại Hotline</label>
              <Input
                type="text"
                placeholder="028 3722 5555"
                value={newStoreForm.phoneNumber}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, phoneNumber: e.target.value })}
                className="focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa Chỉ Cửa Hàng <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="Ví dụ: 215 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. HCM"
              value={newStoreForm.address}
              onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
              className="focus:ring-2"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kho Hàng Xuất Mặc Định (POS)
            </label>
            <select
              value={newStoreForm.defaultWarehouseId}
              onChange={(e) => setNewStoreForm({ ...newStoreForm, defaultWarehouseId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900"
            >
              <option value="">-- Không liên kết kho --</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  [{wh.code}] {wh.name} ({wh.type === "CENTRAL" ? "Kho tổng" : "Kho tại chỗ"})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Khi nhân viên thanh toán tại quầy, hệ thống tự động trừ tồn kho từ kho hàng này.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all"
            >
              Hủy Bỏ
            </button>
            <Button
                      type="submit"
                      disabled={isSubmittingStore}
                      className="px-5 py-2 shadow-sm"
                    >
              {isSubmittingStore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Tạo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Chi Nhánh Mới</span>
                        </>
                      )}
                    </Button>
          </div>
        </form>
    </Modal>
  );
}
