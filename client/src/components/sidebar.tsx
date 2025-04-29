import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package,
  Truck,
  BarChart, 
  Settings
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
      label: "Products",
      icon: Package,
      href: "/products",
      active: location === "/products"
    },
    {
      label: "Orders",
      icon: Truck,
      href: "/orders",
      active: location === "/orders"
    },
    {
      label: "Reports",
      icon: BarChart,
      href: "/reports",
      active: location === "/reports"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: location === "/settings"
    }
  ];
  
  return (
    <div className={cn(
      "bg-white shadow-md w-full border-b border-gray-200 flex-shrink-0",
      "z-40 transition-all duration-300 ease-in-out",
      mobileOpen ? "fixed inset-0 h-screen md:relative md:h-auto" : "block"
    )}>
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">InventoryPro</h1>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={() => setMobileOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="px-4 pb-4">
        <ul className={cn(
          "flex",
          mobileOpen ? "flex-col space-y-2" : "flex-row space-x-4 justify-center md:justify-start"
        )}>
          {routes.map((route) => (
            <li key={route.href}>
              <Link 
                href={route.href} 
                className={cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  route.active 
                    ? "text-primary bg-blue-50"
                    : "text-foreground hover:bg-gray-100"
                )}
              >
                <route.icon className={cn(
                  "h-5 w-5", 
                  mobileOpen ? "mr-3" : "mr-0 md:mr-2"
                )} />
                <span className={mobileOpen ? "block" : "hidden md:block"}>{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
