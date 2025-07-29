import { Home, Plus, MapPin, Car, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/book", icon: Plus, label: "Book" },
  { path: "/track", icon: MapPin, label: "Track" },
  { path: "/vehicles", icon: Car, label: "Vehicles" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-6 py-4 z-50">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className="flex flex-col items-center space-y-1">
                <Icon 
                  className={cn(
                    "w-6 h-6",
                    isActive ? "text-electric" : "text-gray-400"
                  )} 
                />
                <div className={cn(
                  "text-xs",
                  isActive ? "text-electric" : "text-gray-400"
                )}>
                  {item.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
