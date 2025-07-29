import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wallet, Plus, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { userData } = useAuth();

  const { data: recentServices = [] } = useQuery({
    queryKey: ["/api/services/recent"],
    enabled: !!userData,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: !!userData,
  });

  if (!userData) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Status Bar */}
      <div className="bg-black px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm">Good Morning</div>
            <div className="text-xl font-semibold">{userData.name}</div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-electric rounded-full"></div>
            </Button>
            <Link href="/wallet">
              <Button variant="ghost" size="sm" className="bg-surface px-4 py-2 rounded-xl">
                <Wallet className="w-4 h-4 text-electric mr-2" />
                <span className="font-medium">₹{userData.walletBalance}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-surface border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalServices || 0}</div>
              <div className="text-gray-400 text-sm">Total Services</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-electric">₹{stats.savings || 0}</div>
              <div className="text-gray-400 text-sm">Money Saved</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/book">
            <Button className="bg-gradient-to-r from-electric to-electric-dark p-6 rounded-2xl text-black text-left h-auto w-full">
              <div className="flex flex-col items-start">
                <Plus className="w-6 h-6 mb-2" />
                <div className="font-semibold">Book Service</div>
                <div className="text-sm opacity-80">Quick EV service</div>
              </div>
            </Button>
          </Link>
          <Link href="/track">
            <Button 
              variant="outline" 
              className="bg-surface border-gray-700 p-6 rounded-2xl text-left h-auto w-full hover:bg-surface-light"
            >
              <div className="flex flex-col items-start">
                <MapPin className="w-6 h-6 text-electric mb-2" />
                <div className="font-semibold">Track Service</div>
                <div className="text-sm text-gray-400">Live location</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <Link href="/services">
            <Button variant="ghost" size="sm" className="text-electric">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentServices.length === 0 ? (
            <Card className="bg-surface border-gray-800">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-2">No recent services</div>
                <Link href="/book">
                  <Button className="bg-electric text-black">
                    Book Your First Service
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            recentServices.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))
          )}
        </div>
      </div>

      {/* Emergency Service */}
      <div className="px-6 mb-8">
        <Card className="bg-red-900/30 border-red-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold">Emergency Service</div>
                <div className="text-sm text-gray-400">24/7 roadside assistance</div>
              </div>
              <Button className="bg-red-500 text-white">
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
