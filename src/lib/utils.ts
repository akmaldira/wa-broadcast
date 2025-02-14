import { ServerAction } from "@/types/action";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleActionResponse<T>(response: ServerAction<T>) {
  if (response.redirect) {
    window.location.href = response.redirect;
  }
  if (response.status === "success") {
    if (response.message) toast.success(response.message);
    return response.data;
  } else {
    toast.error(response.error);
    return null;
  }
}
