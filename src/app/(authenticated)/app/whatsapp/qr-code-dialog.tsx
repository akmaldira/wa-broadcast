"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { getWhatsAppBotAction, reconnectWhatsAppBotAction } from "./action";
import { toast } from "sonner";
import { WhatsAppWithData } from "@/types/prisma";

export default function QRCodeDialog({
  whatsApp,
}: {
  whatsApp: WhatsAppWithData;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [qrCodeDataURL, setQRCodeDataURL] = React.useState<
    string | undefined
  >();
  const [isPending, startTransition] = React.useTransition();
  React.useEffect(() => {
    if (dialogOpen && whatsApp.status !== "connected") {
      const interval = setInterval(() => {
        startTransition(async () => {
          const response = await getWhatsAppBotAction(whatsApp.id);
          if (response.status === "error") {
            toast.error(response.error);
            setDialogOpen(false);
            return;
          } else if (response.data.qrCode) {
            setQRCodeDataURL(response.data.qrCode);
          }
        });
      }, 15 * 1000);

      return () => clearInterval(interval);
    }
  }, [dialogOpen, whatsApp]);

  function reconnect() {
    startTransition(async () => {
      const response = await reconnectWhatsAppBotAction(whatsApp.id);
      if (response.status === "error") {
        toast.error(response.error);
        return;
      } else if (response.data.qrCode) {
        setQRCodeDataURL(response.data.qrCode);
      } else {
        const toastLoading = toast.loading(
          "Sedang menghubungkan, mohon tunggu sebentar..."
        );
        setTimeout(() => {
          toast.dismiss(toastLoading);
        }, 10 * 1000);
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={whatsApp.status === "connected"}>
          <Eye />
          Lihat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Silakan scan QR code ini untuk login ke WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex items-center justify-center">
          {isPending ? (
            <div className="w-full md:w-96 flex items-center justify-center h-96">
              <Loader2 className="animate-spin" />
            </div>
          ) : qrCodeDataURL ? (
            <Image src={qrCodeDataURL} alt="QR Code" width={400} height={400} />
          ) : (
            <div className="w-full md:w-96 flex flex-col items-center justify-center h-96 gap-4">
              {whatsApp.status == "connected" ? (
                "Sudah terhubung"
              ) : (
                <>
                  <h1 className="text-center">
                    QR Code tidak tersedia, Silakan reconnect
                  </h1>
                  <Button onClick={reconnect}>Reconnect</Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
