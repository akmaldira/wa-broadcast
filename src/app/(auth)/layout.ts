import { auth } from "@/lib/auth";
import { APP_ROUTE } from "@/lib/const";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  const session = await auth();

  if (session && session.user) {
    redirect(APP_ROUTE);
  }

  return children;
}
