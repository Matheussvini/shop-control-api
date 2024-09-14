/*
  Warnings:

  - A unique constraint covering the columns `[clientId,productId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId,productId]` on the table `items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cart_items_clientId_productId_key" ON "cart_items"("clientId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "items_orderId_productId_key" ON "items"("orderId", "productId");
