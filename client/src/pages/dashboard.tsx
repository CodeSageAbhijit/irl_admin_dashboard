import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import InventoryTable from "@/components/inventory-table";
import AddItemForm from "@/components/add-item-form";
import EditItemForm from "@/components/edit-item-form";
import DeleteItemDialog from "@/components/delete-item-dialog";
import Footer from "@/components/footer";
import { Item } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, TrendingUp, Layers } from "lucide-react";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMobile, setSidebarMobile] = useState(false);
  
  const { data, isLoading, error } = useQuery<Item[]>({
    queryKey: ['firebase/items'],
    queryFn: () => import('@/services/inventoryService').then(m => m.getItems()),
  });
  
  const items = data || [];

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const filteredItems = items.filter((item) => {
    return searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity < 5).length;

  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Package,
      iconBg: "bg-[#EEF3FF]",
      iconColor: "text-[#3563E9]",
      accent: "#3563E9",
    },
    {
      label: "Total Quantity",
      value: totalQuantity,
      icon: Layers,
      iconBg: "bg-[#EEF8F4]",
      iconColor: "text-[#1CBD6F]",
      accent: "#1CBD6F",
    },
    {
      label: "Low Stock",
      value: lowStockItems,
      icon: AlertTriangle,
      iconBg: "bg-[#FFF5EE]",
      iconColor: "text-[#FF9500]",
      accent: "#FF9500",
    },
    {
      label: "In Stock",
      value: totalItems - lowStockItems,
      icon: TrendingUp,
      iconBg: "bg-[#EEFAF4]",
      iconColor: "text-[#1CBD6F]",
      accent: "#1CBD6F",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Sidebar mobileOpen={sidebarMobile} setMobileOpen={setSidebarMobile} />
      
      <div className="md:ml-[260px] flex flex-col min-h-screen">
        <Header 
          toggleSidebar={() => setSidebarMobile(!sidebarMobile)} 
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <main className="flex-1 p-5 md:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="page-title">Inventory</h1>
              <p className="page-subtitle">Manage your equipment and supplies</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="btn-primary h-11 px-5 self-start sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </div>

          {/* Stats row */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="stat-card">
                  <Skeleton className="h-11 w-11 rounded-xl mb-4" />
                  <Skeleton className="h-7 w-14 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : !error && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-[#1A202C]">{stat.value}</p>
                  <p className="text-sm font-medium text-[#90A3BF] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-[#E8EFF6] p-6">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-[#FFDDD7] p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-[#FF4423] mx-auto mb-3" />
              <p className="font-semibold text-[#1A202C] mb-4">Failed to load inventory items.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-lg border-[#E8EFF6]">
                Reload
              </Button>
            </div>
          ) : (
            <InventoryTable 
              items={filteredItems} 
              onEdit={handleEditItem} 
              onDelete={handleDeleteItem}
            />
          )}
        </main>
        
        <Footer />
      </div>
      
      <AddItemForm open={showAddModal} onOpenChange={setShowAddModal} />
      {selectedItem && (
        <>
          <EditItemForm open={showEditModal} onOpenChange={setShowEditModal} item={selectedItem} />
          <DeleteItemDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} item={selectedItem} />
        </>
      )}
    </div>
  );
}
