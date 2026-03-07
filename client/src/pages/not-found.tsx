import { Link } from "wouter";
import { Package2, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F7F9]">
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#E8EFF6]">
          <SearchX className="h-10 w-10 text-[#3563E9]" />
        </div>
        <h1 className="text-7xl font-black text-[#3563E9] mb-2">404</h1>
        <h2 className="text-xl font-bold text-[#1A202C] mb-2">Page Not Found</h2>
        <p className="text-sm text-[#90A3BF] mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="btn-primary rounded-lg h-10 px-6 font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="mt-8 flex items-center justify-center gap-2 text-[#90A3BF]">
          <Package2 className="h-4 w-4" />
          <span className="text-xs font-medium">IRL-Inventory</span>
        </div>
      </div>
    </div>
  );
}
