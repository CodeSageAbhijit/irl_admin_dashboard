import { Search, Menu, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profileImage from "@/components/assets/profile.jpeg";

type HeaderProps = {
  toggleSidebar: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Header({ toggleSidebar, searchValue, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#E8EFF6] px-6 py-4 flex items-center justify-between">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#90A3BF] hover:text-[#3563E9] hover:bg-[#F6F7F9]"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#90A3BF]" />
          <Input
            type="text"
            placeholder="Search inventory..."
            className="pl-9 h-10 bg-[#F6F7F9] border-transparent rounded-lg text-sm text-[#1A202C] placeholder:text-[#90A3BF] focus:bg-white focus:border-[#3563E9] transition-colors"
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {/* Right: icons + avatar */}
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full text-[#90A3BF] hover:text-[#3563E9] hover:bg-[#F6F7F9]"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4423] rounded-full border-2 border-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-[#90A3BF] hover:text-[#3563E9] hover:bg-[#F6F7F9]"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={profileImage} alt="User" />
          <AvatarFallback className="bg-[#3563E9] text-white text-xs font-bold">RB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
