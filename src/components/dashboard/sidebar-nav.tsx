"use client";

import { useMemo } from "react";
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
import { useUser } from "@/firebase";
import { useTeachers } from "@/hooks/use-teachers";
import { hasManagementRole } from "@/lib/auth";

const allMenuItems = [
  { href: "/dashboard", icon: Home, label: "Panel Principal", requiredRole: null },
  { href: "/dashboard/students", icon: Users, label: "Estudiantes", requiredRole: null },
  { href: "/dashboard/curriculum", icon: BookOpen, label: "Currículo", requiredRole: null },
  { href: "/dashboard/achievements", icon: Trophy, label: "Logros", requiredRole: null },
  { href: "/dashboard/grades", icon: ClipboardList, label: "Calificaciones", requiredRole: null },
  { href: "/dashboard/behavior", icon: Smile, label: "Comportamiento", requiredRole: null },
  { href: "/dashboard/billing", icon: DollarSign, label: "Facturación", requiredRole: 'management' },
  { href: "/dashboard/users", icon: Shield, label: "Usuarios y Roles", requiredRole: 'management' },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración", requiredRole: null },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: teachers } = useTeachers();
  
  const currentUser = useMemo(() => {
    if (!user || !teachers) return null;
    return teachers.find(t => t.id === user.uid);
  }, [user, teachers]);

  const canManage = useMemo(() => {
    if (!currentUser) return false;
    return hasManagementRole(currentUser.role);
  }, [currentUser]);

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
        if (item.requiredRole === 'management') {
            return canManage;
        }
        return true;
    });
  }, [canManage]);

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
