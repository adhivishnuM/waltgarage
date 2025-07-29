import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PartnerPortal() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingServices = [] } = useQuery({
    queryKey: ["/api/services/pending"],
    enabled: !!userData && userData.role === "partner",
  });

  const { data: activeServices = [] } = useQuery({
    queryKey: ["/api/services/active"],
    enabled: !!userData && userData.role === "partner",
  });

  const { data: partnerStats = {} } = useQuery({
    queryKey: ["/api/partners/stats"],
    enabled: !!userData && userData.role === "partner",
  });

  const acceptServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return apiRequest("POST", `/api/services/${serviceId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service accepted",
        description: "You can now start the service",
      });
    },
  });

  const declineServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return apiRequest("POST", `/api/services/${serviceId}/decline`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service declined",
        description: "The service has been declined",
      });
    },
  });

  if (!userData || userData.role !== "partner") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Access denied. Partner account required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-blue-900 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Partner Dashboard</h1>
            <div className="text-blue-200 text-sm">
              Active Services: {activeServices.length}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-blue-200 text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-electric">
                ₹{partnerStats.todayEarnings || 0}
              </div>
              <div className="text-gray-400 text-sm">Today's Earnings</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {partnerStats.completedServices || 0}
              </div>
              <div className="text-gray-400 text-sm">Services Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Services</h2>
            <Badge className="bg-electric/20 text-electric">
              {pendingServices.length} new requests
            </Badge>
          </div>

          <div className="space-y-4">
            {pendingServices.length === 0 ? (
              <Card className="bg-surface border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-400">No pending services</div>
                </CardContent>
              </Card>
            ) : (
              pendingServices.map((service: any) => (
                <Card key={service.id} className="bg-surface border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium capitalize">
                        {service.serviceType.replace("_", " ")}
                      </div>
                      <Badge className={`text-sm ${
                        service.priority === "urgent" 
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-electric/20 text-electric"
                      }`}>
                        {service.priority === "urgent" ? "Urgent" : "New"}
                      </Badge>
                    </div>
                    
                    <div className="text-gray-400 text-sm mb-3">
                      {service.vehicle?.brand} {service.vehicle?.model} •{" "}
                      {service.serviceLocation?.address || "Location provided"}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4">
                      Distance: 2.5 km • Fee: ₹{service.estimatedCost}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => acceptServiceMutation.mutate(service.id)}
                        disabled={acceptServiceMutation.isPending}
                        className="flex-1 bg-electric text-black font-medium"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => declineServiceMutation.mutate(service.id)}
                        disabled={declineServiceMutation.isPending}
                        variant="outline"
                        className="flex-1 bg-gray-700 border-gray-600"
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Active Services */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Services</h2>
          <div className="space-y-4">
            {activeServices.length === 0 ? (
              <Card className="bg-surface border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-400">No active services</div>
                </CardContent>
              </Card>
            ) : (
              activeServices.map((service: any) => (
                <Card key={service.id} className="bg-surface border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium capitalize">
                        {service.serviceType.replace("_", " ")}
                      </div>
                      <Badge className="text-sm bg-blue-500/20 text-blue-500">
                        In Progress
                      </Badge>
                    </div>
                    
                    <div className="text-gray-400 text-sm mb-3">
                      {service.vehicle?.brand} {service.vehicle?.model} •{" "}
                      Customer: {service.customer?.name}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4">
                      Started: 30 mins ago • Fee: ₹{service.estimatedCost}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-blue-500 text-white font-medium">
                        Update Status
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 bg-gray-700 border-gray-600"
                      >
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
