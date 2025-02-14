"use client";

import { ChevronRightIcon, LayoutDashboard, RadioTower } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "./nav-user";
import Link from "next/link";
import React from "react";
import { WhatsAppIcon } from "./icons/whatsapp";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { User } from "next-auth";

type NavItem =
  | {
      type: "item";
      title: string;
      url: string;
      icon: React.ElementType;
    }
  | {
      type: "group";
      title: string;
      icon: React.ElementType;
      isActive: boolean;
      items: { title: string; url: string }[];
    };
const navPos = [
  {
    type: "item",
    title: "Dashboard",
    url: "/app",
    icon: LayoutDashboard,
  },
  {
    type: "item",
    title: "Akun WhatsApp",
    url: "/app/whatsapp",
    icon: WhatsAppIcon,
  },
  {
    type: "item",
    title: "Broadcast",
    url: "/app/broadcast",
    icon: RadioTower,
  },
] as NavItem[];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Halaman</SidebarGroupLabel>
          <SidebarMenu>
            {navPos.map((item) =>
              item.type === "group" ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="text-md"
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className="text-base">
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem
                  key={item.title}
                  className={cn(
                    "rounded-md",
                    pathname === item.url && "bg-sidebar-accent"
                  )}
                >
                  <SidebarMenuButton asChild className="text-md">
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
