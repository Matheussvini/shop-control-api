-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_orderId_fkey";

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
