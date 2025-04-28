import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import InventoryTable from "@/components/inventory-table";
import InventorySummary from "@/components/inventory-summary";
import AddItemForm from "@/components/add-item-form";
import EditItemForm from "@/components/edit-item-form";
import DeleteItemDialog from "@/components/delete-item-dialog";
import Footer from "@/components/footer";
import { Item } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Upload, Plus, Search } from "lucide-react";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarMobile, setSidebarMobile] = useState(false);
  
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['/api/items'],
  });

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const filteredItems = items?.filter((item: Item) => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase().replace(/-/g, " ");
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <Sidebar mobileOpen={sidebarMobile} setMobileOpen={setSidebarMobile} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          toggleSidebar={() => setSidebarMobile(!sidebarMobile)} 
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <main className="flex-1 p-6">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Item
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="office supplies">Office Supplies</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="w-full overflow-x-auto">
                <Skeleton className="h-[400px] w-full rounded-md" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow mb-6 p-6 text-center">
              <p className="text-red-500">Failed to load inventory items. Please try again.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Reload
              </Button>
            </div>
          ) : (
            <InventoryTable 
              items={filteredItems || []} 
              onEdit={handleEditItem} 
              onDelete={handleDeleteItem}
            />
          )}
          
          <InventorySummary items={items || []} />
        </main>
        
        <Footer />
      </div>
      
      {/* Modals */}
      <AddItemForm open={showAddModal} onOpenChange={setShowAddModal} />
      
      {selectedItem && (
        <>
          <EditItemForm 
            open={showEditModal} 
            onOpenChange={setShowEditModal} 
            item={selectedItem}
          />
          
          <DeleteItemDialog 
            open={showDeleteDialog} 
            onOpenChange={setShowDeleteDialog} 
            item={selectedItem} 
          />
        </>
      )}
    </div>
  );
}
