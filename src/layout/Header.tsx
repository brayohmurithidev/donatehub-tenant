import {Bell, Search, Menu, X} from "lucide-react";
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar.tsx";
import {useAuth} from "@/context/AuthContext";
import {useGetTenant} from "@/hooks/api/useTenant";

const Header = () => {
  const { logout, user } = useAuth();
  const {data: tenant} = useGetTenant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Brand */}
            <div className="flex items-center gap-4">
              <img 
                src={"/donate-hub-with-slogan.png"} 
                alt="DonateHub Logo" 
                className="h-10 w-auto hidden sm:block"
              />
              <img 
                src={"/donate-hub.png"} 
                alt="DonateHub" 
                className="h-8 w-auto sm:hidden"
              />
              
              {/* Brand Info - Hidden on mobile */}
              <div className="hidden lg:block ml-4 border-l border-gray-200 pl-4">
                <h1 className="text-lg font-bold text-gray-900">NGO Dashboard</h1>
                <p className="text-sm text-gray-600">Manage campaigns & track impact</p>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns, donations..."
                  className="w-full rounded-lg border border-gray-300 px-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            {/* Right: Actions and User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger animate-pulse" />
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/brian-logo.png"
                        alt={user?.name || "User"}
                        className="rounded-full"
                      />
                      <AvatarFallback className="bg-primary text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="text-sm">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-danger focus:text-danger"
                    onClick={() => logout()}
                  >
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileMenuOpen && (
            <div className="mt-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns, donations..."
                  className="w-full rounded-lg border border-gray-300 px-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
