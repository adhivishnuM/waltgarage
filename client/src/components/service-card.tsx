import { Service } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service & {
    vehicle?: { brand: string; model: string };
  };
  onTrack?: (service: Service) => void;
  onViewDetails?: (service: Service) => void;
}

export function ServiceCard({ service, onTrack, onViewDetails }: ServiceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-electric/20 text-electric";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-500";
      case "pending":
        return "bg-blue-500/20 text-blue-500";
      case "cancelled":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <Card className="bg-surface border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium capitalize">
            {service.serviceType.replace("_", " ")}
          </div>
          <Badge className={cn("text-sm", getStatusColor(service.status))}>
            {getStatusText(service.status)}
          </Badge>
        </div>
        
        <div className="text-gray-400 text-sm mb-2">
          {service.vehicle && `${service.vehicle.brand} ${service.vehicle.model}`} • 
          {new Date(service.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            ₹{service.finalCost || service.estimatedCost || "0"}
          </div>
          
          <div className="flex space-x-2">
            {service.status === "in_progress" && onTrack && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onTrack(service)}
              >
                Track Now
              </Button>
            )}
            {onViewDetails && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onViewDetails(service)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
