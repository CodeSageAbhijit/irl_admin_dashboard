import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getItemStatus(quantity: number): string {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 10) return "Low Stock";
  return "In Stock";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800";
    case "Out of Stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case "electronics":
      return "bg-blue-100 text-blue-800";
    case "furniture":
      return "bg-purple-100 text-purple-800";
    case "office supplies":
      return "bg-green-100 text-green-800";
    case "kitchen":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function generateCategoryOptions() {
  return [
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "office supplies", label: "Office Supplies" },
    { value: "kitchen", label: "Kitchen" }
  ];
}
