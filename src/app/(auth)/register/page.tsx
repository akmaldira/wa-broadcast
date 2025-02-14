import { redirect } from "next/navigation";
import RegisterClientPage from "./client";
import { INDEX_ROUTE } from "@/lib/const";

export default async function RegisterPage() {
  if (process.env.NODE_ENV === "development") {
    return <RegisterClientPage />;
  } else {
    redirect(INDEX_ROUTE);
  }
}
