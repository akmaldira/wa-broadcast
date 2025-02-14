"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { User } from "next-auth";

export function NavHeader({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2 *:data-[slot=navigation-menu-item]:h-7 **:data-[slot=navigation-menu-link]:py-1 **:data-[slot=navigation-menu-link]:font-medium">
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            data-active={pathname.startsWith("/")}
            className={cn(
              buttonVariants({ variant: "link" }),
              pathname.length == 1 && "font-bold"
            )}
          >
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {["ROOT", "ADMIN"].includes(user.role) && (
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              data-active={pathname.startsWith("/app")}
              className={cn(
                buttonVariants({ variant: "link" }),
                pathname.startsWith("/app") && "font-bold"
              )}
            >
              <Link href="/app">App</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
