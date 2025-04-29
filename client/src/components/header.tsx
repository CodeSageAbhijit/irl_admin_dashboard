import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type HeaderProps = {
  toggleSidebar: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Header({ toggleSidebar, searchValue, onSearchChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2 text-gray-500"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-10 md:w-[250px]"
            value={searchValue}
            onChange={onSearchChange}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
}
