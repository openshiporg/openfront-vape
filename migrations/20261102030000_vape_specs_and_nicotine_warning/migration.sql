-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "batteryCapacityMah" INTEGER,
ADD COLUMN     "coilResistanceOhm" DECIMAL(8,3),
ADD COLUMN     "coilType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "liquidCapacityMl" DECIMAL(8,2),
ADD COLUMN     "nicotineStrengthMgMl" DECIMAL(8,2);

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "nicotineWarningRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "_Product_compatibleWith" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Product_compatibleWith_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Product_compatibleWith_B_index" ON "_Product_compatibleWith"("B");

-- AddForeignKey
ALTER TABLE "_Product_compatibleWith" ADD CONSTRAINT "_Product_compatibleWith_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_compatibleWith" ADD CONSTRAINT "_Product_compatibleWith_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

