import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package,
  Truck,
  BarChart, 
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Store,
  ShoppingCart
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

type MenuItem = {
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  active?: boolean;
  children?: MenuItem[];
};

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["Inventory"]);
  
  const toggleSection = (label: string) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };
  
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: location === "/"
    },
    {
      label: "Inventory",
      icon: Package,
      children: [
        {
          label: "All Products",
          icon: Store,
          href: "/products",
          active: location === "/products"
        },
        {
          label: "Categories",
          icon: Package,
          href: "/categories",
          active: location === "/categories"
        },
        {
          label: "Stock Levels",
          icon: BarChart,
          href: "/stock",
          active: location === "/stock"
        }
      ]
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      children: [
        {
          label: "Orders",
          icon: Truck,
          href: "/orders",
          active: location === "/orders"
        },
        {
          label: "Customers",
          icon: Users,
          href: "/customers",
          active: location === "/customers"
        }
      ]
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
      "bg-white shadow-md md:w-64 w-full border-r border-gray-200 md:h-screen flex-shrink-0",
      "z-40 transition-all duration-300 ease-in-out",
      mobileOpen ? "fixed inset-0 h-screen" : "hidden md:block"
    )}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
      <nav className="p-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              {item.children ? (
                <Collapsible 
                  open={openSections.includes(item.label)}
                  onOpenChange={() => toggleSection(item.label)}
                  className="w-full"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-md mb-1 transition-colors w-full",
                      "text-foreground hover:bg-gray-100"
                    )}>
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      {openSections.includes(item.label) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="pl-8 space-y-1 my-1">
                      {item.children.map((child, childIndex) => (
                        <li key={`${child.label}-${childIndex}`}>
                          <Link
                            href={child.href || '#'}
                            className={cn(
                              "flex items-center p-2 rounded-md mb-1 transition-colors",
                              child.active
                                ? "text-primary bg-blue-50"
                                : "text-foreground hover:bg-gray-100"
                            )}
                          >
                            <child.icon className="mr-3 h-4 w-4" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link 
                  href={item.href || '#'} 
                  className={cn(
                    "flex items-center p-3 rounded-md mb-1 transition-colors",
                    item.active 
                      ? "text-primary bg-blue-50"
                      : "text-foreground hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
