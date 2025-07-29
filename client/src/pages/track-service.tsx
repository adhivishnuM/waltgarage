import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { TrackingMap } from "@/components/tracking-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function TrackService() {
  const { userData } = useAuth();

  const { data: activeService } = useQuery({
    queryKey: ["/api/services/active"],
    enabled: !!userData,
  });

  const { data: tracking } = useQuery({
    queryKey: ["/api/services", activeService?.id, "tracking"],
    enabled: !!activeService,
    refetchInterval: 5000, // Update every 5 seconds
  });

  if (!activeService) {
    return (
      <div className="min-h-screen bg-black pb-20">
        <div className="bg-black px-6 pt-12 pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <Link href="/home">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Track Service</h1>
          </div>
        </div>

        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-4">No active service to track</div>
          <Link href="/book">
            <Button className="bg-electric text-black">
              Book a Service
            </Button>
          </Link>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_way":
        return "bg-blue-500/20 text-blue-500";
      case "arrived":
        return "bg-electric/20 text-electric";
      case "working":
        return "bg-yellow-500/20 text-yellow-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_way":
        return "Technician on the way";
      case "arrived":
        return "Technician arrived";
      case "working":
        return "Service in progress";
      default:
        return "Service scheduled";
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black px-6 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Track Service</h1>
            <div className="text-sm text-electric">
              {getStatusText(tracking?.status || "scheduled")}
            </div>
          </div>
        </div>
      </div>

      {/* Live Map */}
      {tracking && (
        <TrackingMap 
          tracking={tracking} 
          className="h-64 bg-surface border-b border-gray-800" 
        />
      )}

      {/* Service Status */}
      <div className="px-6 py-6">
        <Card className="bg-electric/10 border-electric mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-electric rounded-full animate-pulse"></div>
              <div className="font-medium text-electric">
                {getStatusText(tracking?.status || "scheduled")}
              </div>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Estimated arrival: {tracking?.estimatedArrival ? 
                new Date(tracking.estimatedArrival).toLocaleTimeString() : 
                "15 minutes"}
            </div>
          </CardContent>
        </Card>

        {/* Technician Details */}
        <Card className="bg-surface border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xl">👨‍🔧</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold">Technician Assigned</div>
                <div className="text-gray-400 text-sm">EV Specialist • 4.8 ⭐</div>
                <div className="text-electric text-sm">+91 98765 43210</div>
              </div>
              <div className="space-y-2">
                <Button size="sm" className="w-10 h-10 bg-electric text-black rounded-xl p-0">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 rounded-xl p-0">
                  <MessageCircle className="w-4 h-4 text-electric" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold">Service Timeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-electric rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Service Confirmed</div>
                <div className="text-gray-400 text-sm">
                  {new Date(activeService.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                tracking?.status === "on_way" ? "bg-electric animate-pulse" : "bg-electric"
              }`}></div>
              <div className="flex-1">
                <div className={`font-medium ${
                  tracking?.status === "on_way" ? "text-electric" : ""
                }`}>
                  Technician Dispatched
                </div>
                <div className="text-gray-400 text-sm">
                  {tracking?.lastUpdated ? 
                    new Date(tracking.lastUpdated).toLocaleString() : 
                    "In progress"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                tracking?.status === "working" ? "bg-electric" : "bg-gray-600"
              }`}></div>
              <div className="flex-1">
                <div className={`font-medium ${
                  tracking?.status === "working" ? "text-electric" : "text-gray-400"
                }`}>
                  Service in Progress
                </div>
                <div className="text-gray-400 text-sm">
                  {tracking?.status === "working" ? "Now" : "Awaiting arrival"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-400">Service Complete</div>
                <div className="text-gray-400 text-sm">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <Card className="bg-surface border-gray-700 mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Service Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vehicle</span>
                <span>{activeService.vehicle?.brand} {activeService.vehicle?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Issue</span>
                <span className="capitalize">{activeService.serviceType.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service Fee</span>
                <span className="text-electric">₹{activeService.estimatedCost}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
