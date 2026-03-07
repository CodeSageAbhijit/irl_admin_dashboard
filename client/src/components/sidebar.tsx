import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ClipboardList,
  RotateCcw,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: location === "/"
    },
    {
      label: "Requests",
      icon: ClipboardList,
      href: "/requests",
      active: location === "/requests"
    },
    {
      label: "Return Requests",
      icon: RotateCcw,
      href: "/return-requests",
      active: location === "/return-requests"
    }
  ];
  
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-extrabold tracking-tight text-[#3563E9]">IRL</span>
          <span className="text-[22px] font-extrabold tracking-tight text-[#1A202C]">nventory</span>
        </div>
        <button
          className="md:hidden text-[#90A3BF] hover:text-[#3563E9] transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav section label */}
      <p className="px-6 text-[11px] font-semibold uppercase tracking-widest text-[#90A3BF] mb-3">
        Main Menu
      </p>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => setMobileOpen(false)}
            className={cn("sidebar-nav-item", route.active ? "active" : "")}
          >
            <route.icon className="flex-shrink-0" style={{ width: 20, height: 20 }} />
            <span>{route.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-6 py-5 border-t border-[#E8EFF6]">
        <p className="text-xs font-semibold text-[#1A202C]">Robonauts Team</p>
        <p className="text-[11px] text-[#90A3BF] mt-0.5">© 2025 IRL-Inventory</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] min-h-screen flex-shrink-0 fixed left-0 top-0 bottom-0 z-20 bg-white border-r border-[#E8EFF6]">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[260px] z-40 flex flex-col md:hidden bg-white border-r border-[#E8EFF6] transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
