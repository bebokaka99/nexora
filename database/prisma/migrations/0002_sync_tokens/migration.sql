-- CreateEnum
CREATE TYPE "SyncJobType" AS ENUM ('SYNC_INVENTORY', 'PULL_ORDERS');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- AlterTable
ALTER TABLE "channel_connections" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "last_sync_at" TIMESTAMP(3),
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "token_expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "channel_id" VARCHAR(36) NOT NULL,
    "tenant_id" VARCHAR(36) NOT NULL,
    "job_type" "SyncJobType" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_product_mappings" (
    "id" TEXT NOT NULL,
    "channel_id" VARCHAR(36) NOT NULL,
    "tenant_id" VARCHAR(36) NOT NULL,
    "variant_id" VARCHAR(36) NOT NULL,
    "external_item_id" VARCHAR(100) NOT NULL,
    "external_model_id" VARCHAR(100),
    "external_sku_id" VARCHAR(100),
    "external_warehouse_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_product_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_logs_channel_id_created_at_idx" ON "sync_logs"("channel_id", "created_at");

-- CreateIndex
CREATE INDEX "sync_logs_tenant_id_created_at_idx" ON "sync_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "channel_product_mappings_tenant_id_variant_id_idx" ON "channel_product_mappings"("tenant_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "channel_product_mappings_channel_id_variant_id_key" ON "channel_product_mappings"("channel_id", "variant_id");

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_product_mappings" ADD CONSTRAINT "channel_product_mappings_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_product_mappings" ADD CONSTRAINT "channel_product_mappings_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

