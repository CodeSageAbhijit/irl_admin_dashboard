import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  // Check if date is null, undefined, or empty string
  if (date === null || date === undefined || date === "") {
    return "Invalid Date";
  }

  let d: Date;

  // If the input is a string, attempt to parse it into a Date object
  if (typeof date === 'string') {
    d = new Date(date);
    // If the string cannot be parsed into a valid Date, return "Invalid Date"
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
  } else if (date instanceof Date) {
    // If the input is already a Date object, use it directly
    d = date;
    // If the Date object is invalid (NaN), return "Invalid Date"
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
  } else {
    return "Invalid Date"; // If it's neither a string nor a Date object, return "Invalid Date"
  }

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

export function getCategoryColor(category?: string): string {
  if (!category) return "bg-gray-100 text-gray-800"; // fallback style

  switch (category.toLowerCase()) {
    case "electronics":
      return "bg-blue-100 text-blue-800";
    case "furniture":
      return "bg-yellow-100 text-yellow-800";
    case "clothing":
      return "bg-green-100 text-green-800";
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
