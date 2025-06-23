import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AppLayout({ children, currentPage }: AppLayoutProps) {
  const location = useLocation();
  const actualCurrentPage = currentPage || (location.pathname === "/v2" ? "v2" : "sales-reports");
  
  const getPageTitle = () => {
    switch (actualCurrentPage) {
      case "v2":
        return "Sales Intelligence Dashboard";
      default:
        return "Sales Reports";
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-4">
            <img 
              src="/logo.png" 
              alt="JusConnect Logo" 
              className="h-24 w-auto"
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={actualCurrentPage === "sales-reports"}>
                <Link to="/">
                  <BarChart3 className="h-4 w-4" />
                  <span>Sales Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={actualCurrentPage === "v2"}>
                <Link to="/v2">
                  <TrendingUp className="h-4 w-4" />
                  <span>V2</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
