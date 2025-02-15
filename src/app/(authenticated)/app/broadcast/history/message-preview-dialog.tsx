"use client";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MessagePreviewDialog({
  message,
  rawMedia,
}: {
  message: string;
  rawMedia: string | null;
}) {
  const media = JSON.parse(rawMedia || "[]");
  const mediaList = Array.isArray(media) ? media : [media];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Lihat Pesan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pesan</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <h1>Media</h1>
          <div>
            {mediaList.map((media, i) => (
              <div key={i}>
                <h1>{media.originalname}</h1>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1>Pesan</h1>
          <AutosizeTextarea readOnly value={message} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
