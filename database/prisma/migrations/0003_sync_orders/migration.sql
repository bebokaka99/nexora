-- AlterTable
ALTER TABLE "sync_logs" ADD COLUMN     "pulled_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skipped_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenant_id_channel_type_external_order_id_key" ON "orders"("tenant_id", "channel_type", "external_order_id");

