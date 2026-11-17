"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  MOCK_CONVERSATIONS,
  type ConversationItem,
  type OrderItem,
} from "@/lib/mock-data";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { PosTab } from "@/components/dashboard/PosTab";
import { OrdersTab } from "@/components/dashboard/OrdersTab";
import { InventoryTab } from "@/components/dashboard/InventoryTab";
import { ChannelsTab } from "@/components/dashboard/ChannelsTab";
import { ProductsTab } from "@/components/dashboard/ProductsTab";
import { ChatTab } from "@/components/dashboard/ChatTab";
import { StoresTab } from "@/components/dashboard/StoresTab";
import { OrderDetailModal } from "@/components/dashboard/OrderDetailModal";
import { TransferModal } from "@/components/dashboard/TransferModal";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";
import { AddStoreModal } from "@/components/dashboard/AddStoreModal";
import { ToastBanner } from "@/components/ui/toast";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";
import { useStores } from "@/components/dashboard/use-stores";
import { usePos } from "@/components/dashboard/use-pos";
import type { DashboardTab } from "@/components/dashboard/types";

// =============================================================================
// MAIN COMPONENT: INTERACTIVE DASHBOARD DEMO (TASK-012: tach tu 2.635 dong)
// State dung chung nam o use-dashboard-data / use-pos / use-stores;
// moi tab/modal la 1 component rieng duoi components/dashboard/.
// Route van la /dashboard voi 8 tab noi bo, du lieu van la mock.
// =============================================================================

export default function DashboardDemoPage() {
  const router = useRouter();
  const { user, tenant, isAuthenticated, isLoading, logout } = useAuth();

  // Route Guard: Tự động chuyển hướng về trang đăng nhập nếu chưa xác thực
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/dang-nhap?redirect=/quan-tri");
    }
  }, [isLoading, isAuthenticated, router]);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Shared state (tach tu page.tsx goc)
  const data = useDashboardData();
  const storesApi = useStores({ triggerToast: data.triggerToast, isAuthenticated });
  const pos = usePos({
    products: data.products,
    setOrders: data.setOrders,
    setActivities: data.setActivities,
    stores: storesApi.stores,
    posStore: storesApi.posStore,
    triggerToast: data.triggerToast,
    triggerErrorToast: data.triggerErrorToast,
  });

  // Modals & chat state (rieng cua page)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [selectedConv, setSelectedConv] = useState<ConversationItem>(MOCK_CONVERSATIONS[0]);
  const [chatMessage, setChatMessage] = useState("");

  // Trạng thái kiểm tra xác thực và bảo vệ tuyến đường
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Đang đồng bộ Workspace NEXORA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Chưa đăng nhập. Đang chuyển hướng tới trang Đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ordersCount={data.orders.length}
        lowStockCount={data.lowStockCount}
        storesCount={storesApi.stores.length}
        tenant={tenant}
        user={user}
        onLogout={logout}
      />

      {/* =======================================================================
          MAIN CONTENT AREA
      ======================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          activeTab={activeTab}
          storesCount={storesApi.stores.length}
          isSyncingChannels={data.isSyncingChannels}
          onSync={data.handleTriggerChannelSync}
          onGoPos={() => setActiveTab("pos")}
          user={user}
          tenant={tenant}
          onLogout={logout}
        />

        {/* Toast Notification Banner */}
        {data.toastMessage && (
          <ToastBanner message={data.toastMessage} variant={data.toastVariant} onClose={data.clearToast} />
        )}

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-800">
          {activeTab === "overview" && (
            <OverviewTab
              totalRevenue={data.totalRevenue}
              totalOrdersCount={data.totalOrdersCount}
              totalAvailableStock={data.totalAvailableStock}
              lowStockCount={data.lowStockCount}
              activities={data.activities}
              onGoChannels={() => setActiveTab("channels")}
            />
          )}

          {activeTab === "pos" && (
            <PosTab
              pos={pos}
              stores={storesApi.stores}
              posStore={storesApi.posStore}
              setPosStore={storesApi.setPosStore}
            />
          )}

          {activeTab === "orders" && (
            <OrdersTab
              filteredOrders={data.filteredOrders}
              orderSearchText={data.orderSearchText}
              setOrderSearchText={data.setOrderSearchText}
              orderChannelFilter={data.orderChannelFilter}
              setOrderChannelFilter={data.setOrderChannelFilter}
              orderStatusFilter={data.orderStatusFilter}
              setOrderStatusFilter={data.setOrderStatusFilter}
              onSelectOrder={setSelectedOrder}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab
              products={data.products}
              onOpenTransfer={() => data.setShowTransferModal(true)}
            />
          )}

          {activeTab === "channels" && (
            <ChannelsTab
              channels={data.channels}
              isSyncingChannels={data.isSyncingChannels}
              onSync={data.handleTriggerChannelSync}
            />
          )}

          {activeTab === "products" && <ProductsTab products={data.products} />}

          {activeTab === "chat" && (
            <ChatTab
              selectedConv={selectedConv}
              onSelectConv={setSelectedConv}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              triggerToast={data.triggerToast}
              onOpenPos={() => setActiveTab("pos")}
            />
          )}

          {activeTab === "stores" && (
            <StoresTab
              stores={storesApi.stores}
              warehouses={storesApi.warehouses}
              isStoresLoading={storesApi.isStoresLoading}
              onRefresh={storesApi.fetchStoresAndWarehouses}
              onAddStore={() => {
                storesApi.setAddStoreError(null);
                storesApi.setShowAddStoreModal(true);
              }}
              onOpenPosForStore={(storeId) => {
                storesApi.setPosStore(storeId);
                setActiveTab("pos");
              }}
            />
          )}
        </main>
      </div>

      {/* Modal 1: Order detail */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          triggerToast={data.triggerToast}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Modal 2: Inventory transfer */}
      {data.showTransferModal && (
        <TransferModal
          products={data.products}
          transferProductId={data.transferProductId}
          setTransferProductId={data.setTransferProductId}
          transferFrom={data.transferFrom}
          setTransferFrom={data.setTransferFrom}
          transferQty={data.transferQty}
          setTransferQty={data.setTransferQty}
          onExecute={data.handleExecuteTransfer}
          onClose={() => data.setShowTransferModal(false)}
        />
      )}

      {/* Modal 3: POS thermal receipt */}
      {pos.completedReceipt && (
        <ReceiptModal
          receipt={pos.completedReceipt}
          onClose={() => pos.setCompletedReceipt(null)}
        />
      )}

      {/* Modal 4: Add store branch */}
      {storesApi.showAddStoreModal && (
        <AddStoreModal
          form={storesApi.newStoreForm}
          setForm={storesApi.setNewStoreForm}
          warehouses={storesApi.warehouses}
          isSubmitting={storesApi.isSubmittingStore}
          error={storesApi.addStoreError}
          onSubmit={storesApi.handleCreateStore}
          onClose={() => storesApi.setShowAddStoreModal(false)}
        />
      )}
    </div>
  );
}
