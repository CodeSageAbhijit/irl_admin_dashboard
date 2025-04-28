import React, { useState } from "react";
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Package
} from "lucide-react";
import { Item } from "@shared/schema";
import { formatDate, getStatusColor, getCategoryColor } from "@/lib/utils";

type SortDirection = "asc" | "desc";
type SortField = "id" | "name" | "category" | "quantity" | "status" | "lastUpdated";

interface InventoryTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export default function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  };
  
  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === "id") {
      comparison = a.itemId.localeCompare(b.itemId);
    } else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "category") {
      comparison = a.category.localeCompare(b.category);
    } else if (sortField === "quantity") {
      comparison = a.quantity - b.quantity;
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === "lastUpdated") {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      comparison = dateA - dateB;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });
  
  // Paginate items
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />;
    return sortDirection === "asc" ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px]">
                <div className="flex items-center">
                  <Checkbox 
                    checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("id")}>
                <div className="flex items-center">
                  <span>ID</span>
                  {renderSortIcon("id")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  <span>Name</span>
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("category")}>
                <div className="flex items-center">
                  <span>Category</span>
                  {renderSortIcon("category")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("quantity")}>
                <div className="flex items-center">
                  <span>Quantity</span>
                  {renderSortIcon("quantity")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-primary" onClick={() => handleSort("lastUpdated")}>
                <div className="flex items-center">
                  <span>Last Updated</span>
                  {renderSortIcon("lastUpdated")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                      aria-label={`Select item ${item.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    {item.imageUrl ? (
                      <div className="w-10 h-10 relative rounded overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            const fallbackIcon = target.parentElement!.querySelector('.fallback-icon') as HTMLElement;
                            if (fallbackIcon) {
                              fallbackIcon.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="fallback-icon hidden absolute inset-0 bg-gray-100 items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">#{item.itemId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(item)}
                      className="text-primary hover:text-primary-hover"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {items.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, items.length)}
                </span>{" "}
                of <span className="font-medium">{items.length}</span> results
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-md"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNumber;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    className={currentPage === pageNumber ? "bg-primary text-white" : ""}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                className="rounded-r-md"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
