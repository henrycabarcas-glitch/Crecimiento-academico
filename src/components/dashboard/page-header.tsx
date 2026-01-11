"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-auto items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 py-4">
      <div className="md:hidden">
          <SidebarTrigger />
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <UserNav />
      </div>
    </header>
  );
}
