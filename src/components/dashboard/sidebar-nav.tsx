"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Smile,
  DollarSign,
  Settings,
  Shield,
  Trophy,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", icon: Home, label: "Panel Principal" },
  { href: "/dashboard/students", icon: Users, label: "Estudiantes" },
  { href: "/dashboard/curriculum", icon: BookOpen, label: "Currículo" },
  { href: "/dashboard/achievements", icon: Trophy, label: "Logros" },
  { href: "/dashboard/grades", icon: ClipboardList, label: "Calificaciones" },
  { href: "/dashboard/behavior", icon: Smile, label: "Comportamiento" },
  { href: "/dashboard/billing", icon: DollarSign, label: "Facturación" },
  { href: "/dashboard/users", icon: Shield, label: "Usuarios y Roles" },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
