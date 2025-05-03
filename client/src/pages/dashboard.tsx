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
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMobile, setSidebarMobile] = useState(false);
  
  const { data, isLoading, error } = useQuery<Item[]>({
    queryKey: ['/api/items'],
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Sidebar mobileOpen={sidebarMobile} setMobileOpen={setSidebarMobile} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          toggleSidebar={() => setSidebarMobile(!sidebarMobile)} 
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <main className="flex-1 p-6">
          {/* Action Bar - Simplified */}
          <div className="flex justify-between mb-6">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
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
              items={filteredItems} 
              onEdit={handleEditItem} 
              onDelete={handleDeleteItem}
            />
          )}
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