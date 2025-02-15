-- DropForeignKey
ALTER TABLE "broadcast" DROP CONSTRAINT "broadcast_whatsapp_id_fkey";

-- AddForeignKey
ALTER TABLE "broadcast" ADD CONSTRAINT "broadcast_whatsapp_id_fkey" FOREIGN KEY ("whatsapp_id") REFERENCES "whatsapp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
