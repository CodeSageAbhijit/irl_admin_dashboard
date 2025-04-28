import { Card, CardContent } from "@/components/ui/card";
import { Item } from "@shared/schema";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";

interface InventorySummaryProps {
  items: Item[];
}

export default function InventorySummary({ items }: InventorySummaryProps) {
  // Calculate inventory summary stats
  const totalItems = items.length;
  const inStockItems = items.filter(item => item.status === "In Stock").length;
  const lowStockItems = items.filter(item => item.status === "Low Stock").length;
  const outOfStockItems = items.filter(item => item.status === "Out of Stock").length;
  
  // Calculate category percentages
  const categories = items.reduce<Record<string, number>>((acc, item) => {
    const category = item.category.toLowerCase();
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categories).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
    percentage: Math.round((count / Math.max(1, totalItems)) * 100)
  })).sort((a, b) => b.count - a.count).slice(0, 4);
  
  // Mock recent activities (would come from a real API in production)
  const recentActivities = [
    { 
      type: "add", 
      icon: Plus, 
      bgColor: "bg-blue-100", 
      iconColor: "text-blue-600", 
      item: "Wireless Keyboard", 
      time: "2 hours ago" 
    },
    { 
      type: "edit", 
      icon: Edit, 
      bgColor: "bg-green-100", 
      iconColor: "text-green-600", 
      item: "Office Chair", 
      time: "Yesterday",
      detail: "quantity" 
    },
    { 
      type: "delete", 
      icon: Trash2, 
      bgColor: "bg-red-100", 
      iconColor: "text-red-600", 
      item: "Desk Organizer", 
      time: "2 days ago" 
    },
    { 
      type: "alert", 
      icon: AlertTriangle, 
      bgColor: "bg-yellow-100", 
      iconColor: "text-yellow-600", 
      item: "USB Charger", 
      time: "3 days ago",
      detail: "low stock"
    }
  ];

  // Get category bar color
  const getCategoryColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "electronics":
        return "bg-blue-500";
      case "office supplies":
        return "bg-green-500";
      case "furniture":
        return "bg-purple-500";
      case "kitchen":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Inventory Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Inventory Summary</h3>
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Items</p>
              <p className="text-2xl font-semibold">{totalItems}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">In Stock</p>
              <p className="text-2xl font-semibold">{inStockItems}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Low Stock</p>
              <p className="text-2xl font-semibold">{lowStockItems}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
              <p className="text-2xl font-semibold">{outOfStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Categories Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Top Categories</h3>
            <span className="text-primary text-sm cursor-pointer">View All</span>
          </div>
          <div>
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-sm">No categories to display</p>
            ) : (
              categoryData.map((category, index) => (
                <div key={index} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getCategoryColor(category.name)} h-2 rounded-full`} 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activities Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Activities</h3>
            <span className="text-primary text-sm cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`h-8 w-8 rounded-full ${activity.bgColor} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div>
                  {activity.type === "add" && (
                    <p className="text-sm">Added <span className="font-medium">{activity.item}</span></p>
                  )}
                  {activity.type === "edit" && (
                    <p className="text-sm">Updated <span className="font-medium">{activity.item}</span> {activity.detail}</p>
                  )}
                  {activity.type === "delete" && (
                    <p className="text-sm">Removed <span className="font-medium">{activity.item}</span></p>
                  )}
                  {activity.type === "alert" && (
                    <p className="text-sm"><span className="font-medium">{activity.item}</span> is running {activity.detail}</p>
                  )}
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
