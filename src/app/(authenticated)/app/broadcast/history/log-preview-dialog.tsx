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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";

export default function LogPreviewDialog({
  type,
  logs,
}: {
  type: "error" | "success";
  logs: string[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={type == "error" ? "destructive" : "secondary"}
          disabled={logs.length < 1}
        >
          <Eye /> ({logs.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type == "error" ? "Error" : "Success"} Log</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <div>
            <h1>{type == "error" ? "Errors" : "Success"}</h1>
            <AutosizeTextarea readOnly value={logs.join("\n")} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
