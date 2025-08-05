import {Bell} from "lucide-react";

// import ReactLogo from "";
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
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const {data: tenant} = useGetTenant()

    console.log({tenant})

  return (
    <header className="w-full border-b bg-white px-4 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img src={"/logo.svg"} alt="Logo" width={32} height={32} />
        {/*<span className="font-bold text-lg hidden sm:block">Platform</span>*/}
      </div>

      {/* Center: Search (hidden on mobile) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-6 h-6" />
          {/* Optional badge */}
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src="/vite.svg"
                alt="User"
                className="rounded-full w-6 h-6"
              />
              <AvatarFallback>BM</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={() => logout()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/*/!* Optional mobile menu toggle *!/*/}
        {/*<button className="md:hidden" onClick={() => setIsMobileMenuOpen(prev => !prev)}>*/}
        {/*    <Menu className="w-5 h-5" />*/}
        {/*</button>*/}
      </div>
    </header>
  );
};

export default Header;
