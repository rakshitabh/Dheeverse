import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "../components/app-sidebar";
import { GlobalNavbar } from "../components/global-navbar";
import { Sheet, SheetContent } from "../components/ui/sheet";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(true);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block border-r bg-sidebar transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AppSidebar collapsed={sidebarCollapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global Navbar */}
        <GlobalNavbar onMenuClick={handleMenuClick} />

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
