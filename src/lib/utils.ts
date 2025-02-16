import { ServerAction } from "@/types/action";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { AsYouType } from "libphonenumber-js";

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

export function getPhoneDataServer(phone: string) {
  const asYouType = new AsYouType();
  asYouType.input(phone);
  const number = asYouType.getNumber();
  return {
    phoneNumber: number?.number,
    countryCode: number?.country,
    countryCallingCode: number?.countryCallingCode,
    carrierCode: number?.carrierCode,
    nationalNumber: number?.nationalNumber,
    internationalNumber: number?.formatInternational(),
    possibleCountries: number?.getPossibleCountries().join(", "),
    isValid: number?.isValid(),
    isPossible: number?.isPossible(),
    uri: number?.getURI(),
    type: number?.getType(),
  };
}
