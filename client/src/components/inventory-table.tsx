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
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Package,
  ChevronsUpDown
} from "lucide-react";
import { Item } from "@shared/schema";

type SortDirection = "asc" | "desc";
type SortField = "id" | "name" | "quantity";

interface InventoryTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export default function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;
    if (sortField === "id") {
      comparison = (a.id || 0) - (b.id || 0);
    } else if (sortField === "name") {
      comparison = (a.name || "").localeCompare(b.name || "");
    } else if (sortField === "quantity") {
      comparison = a.quantity - b.quantity;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 text-[#90A3BF] opacity-60" />;
    return sortDirection === "asc" ? 
      <ChevronUp className="h-3.5 w-3.5 ml-1 text-[#3563E9]" /> : 
      <ChevronDown className="h-3.5 w-3.5 ml-1 text-[#3563E9]" />;
  };

  const getQuantityBadge = (qty: number) => {
    if (qty === 0) return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0 text-xs font-semibold">Out of Stock</Badge>;
    if (qty < 5) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-xs font-semibold">Low Stock</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-xs font-semibold">In Stock</Badge>;
  };
  
  return (
    <div className="bg-white rounded-xl border border-[#E8EFF6] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F6F7F9] hover:bg-[#F6F7F9] border-b border-[#E8EFF6]">
              <TableHead className="w-[60px] text-center text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pl-5">
                Image
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 hover:text-[#3563E9] transition-colors"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  {renderSortIcon("id")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 hover:text-[#3563E9] transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 hover:text-[#3563E9] transition-colors"
                onClick={() => handleSort("quantity")}
              >
                <div className="flex items-center">
                  <span>Quantity</span>
                  {renderSortIcon("quantity")}
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-[#F6F7F9] rounded-xl flex items-center justify-center">
                      <Package className="h-7 w-7 text-[#90A3BF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A202C]">No items found</p>
                      <p className="text-sm text-[#90A3BF] mt-0.5">Add your first inventory item to get started</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#F6F7F9] transition-colors border-b border-[#E8EFF6] group">
                  <TableCell className="py-3 pl-5">
                    {item.image_url ? (
                      <div className="w-10 h-10 relative rounded-xl overflow-hidden ring-1 ring-[#E8EFF6]">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            const fallback = target.parentElement!.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="fallback-icon hidden absolute inset-0 bg-[#F6F7F9] items-center justify-center">
                          <Package className="h-4 w-4 text-[#90A3BF]" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F6F7F9] to-[#E8EFF6] rounded-xl flex items-center justify-center">
                        <Package className="h-4 w-4 text-[#90A3BF]" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs font-mono font-semibold text-[#90A3BF] bg-[#F6F7F9] px-2 py-0.5 rounded-lg border border-[#E8EFF6]">
                      #{item.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-semibold text-[#1A202C] text-sm">{item.name}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm font-bold text-[#1A202C]">{item.quantity}</span>
                    <span className="text-xs text-[#90A3BF] ml-1">units</span>
                  </TableCell>
                  <TableCell className="py-3">
                    {getQuantityBadge(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right py-3 pr-5">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 p-0 rounded-lg text-[#3563E9] hover:text-[#2851d4] hover:bg-[#EEF3FF]"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {items.length > 0 && (
        <div className="px-5 py-3.5 flex items-center justify-between border-t border-[#E8EFF6] bg-[#F6F7F9]">
          <p className="text-xs text-[#90A3BF]">
            Showing <span className="font-semibold text-[#1A202C]">{(currentPage - 1) * itemsPerPage + 1}</span> –{" "}
            <span className="font-semibold text-[#1A202C]">{Math.min(currentPage * itemsPerPage, items.length)}</span>{" "}
            of <span className="font-semibold text-[#1A202C]">{items.length}</span> items
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg border-[#E8EFF6] text-[#90A3BF] hover:bg-[#EEF3FF] hover:text-[#3563E9] hover:border-[#3563E9]"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNumber: number;
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
                  className={
                    currentPage === pageNumber
                      ? "h-7 w-7 rounded-lg bg-[#3563E9] text-white border-0 hover:bg-[#2851d4] text-xs font-bold"
                      : "h-7 w-7 rounded-lg border-[#E8EFF6] text-[#1A202C] hover:bg-[#EEF3FF] hover:text-[#3563E9] hover:border-[#3563E9] text-xs font-medium"
                  }
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg border-[#E8EFF6] text-[#90A3BF] hover:bg-[#EEF3FF] hover:text-[#3563E9] hover:border-[#3563E9]"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}