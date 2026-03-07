export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E8EFF6] py-4 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-sm font-medium text-[#90A3BF]">&copy; 2025 IRL-Inventory. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="text-sm font-medium text-[#90A3BF] hover:text-[#3563E9] transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm font-medium text-[#90A3BF] hover:text-[#3563E9] transition-colors">Terms of Service</a>
          <a href="#" className="text-sm font-medium text-[#90A3BF] hover:text-[#3563E9] transition-colors">Help</a>
        </div>
      </div>
    </footer>
  );
}
