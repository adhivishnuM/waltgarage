import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wallet, 
  History, 
  Gift, 
  Settings, 
  Headphones, 
  LogOut,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black px-6 pt-12 pb-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            {userData.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h1 className="text-2xl font-semibold">{userData.name}</h1>
          <div className="text-gray-400">{userData.email}</div>
          <div className="text-electric text-sm mt-2">⭐ 4.9 Customer Rating</div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">24</div>
              <div className="text-gray-400 text-sm">Services</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-electric">₹5,400</div>
              <div className="text-gray-400 text-sm">Saved</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-gray-400 text-sm">Referrals</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-6 space-y-4">
        <Link href="/wallet">
          <Button 
            variant="ghost"
            className="w-full bg-surface p-4 rounded-2xl border border-gray-700 text-left h-auto justify-start"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 bg-electric/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-electric" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Wallet</div>
                <div className="text-gray-400 text-sm">
                  Balance: <span className="text-electric">₹{userData.walletBalance}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Button>
        </Link>

        <Link href="/service-history">
          <Button 
            variant="ghost"
            className="w-full bg-surface p-4 rounded-2xl border border-gray-700 text-left h-auto justify-start"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Service History</div>
                <div className="text-gray-400 text-sm">View past bookings</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Button>
        </Link>

        <Link href="/referrals">
          <Button 
            variant="ghost"
            className="w-full bg-surface p-4 rounded-2xl border border-gray-700 text-left h-auto justify-start"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Refer & Earn</div>
                <div className="text-gray-400 text-sm">Get ₹100 per referral</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Button>
        </Link>

        <Link href="/settings">
          <Button 
            variant="ghost"
            className="w-full bg-surface p-4 rounded-2xl border border-gray-700 text-left h-auto justify-start"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Settings</div>
                <div className="text-gray-400 text-sm">Preferences & privacy</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Button>
        </Link>

        <Link href="/support">
          <Button 
            variant="ghost"
            className="w-full bg-surface p-4 rounded-2xl border border-gray-700 text-left h-auto justify-start"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Headphones className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Help & Support</div>
                <div className="text-gray-400 text-sm">FAQs, chat support</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Button>
        </Link>

        <Button 
          onClick={handleLogout}
          variant="ghost"
          className="w-full bg-red-900/30 p-4 rounded-2xl border border-red-700 text-left h-auto justify-start"
        >
          <div className="flex items-center space-x-4 w-full">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-500">Logout</div>
              <div className="text-gray-400 text-sm">Sign out of your account</div>
            </div>
          </div>
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
