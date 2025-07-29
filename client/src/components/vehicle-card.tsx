import { Vehicle } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (vehicle: Vehicle) => void;
}

export function VehicleCard({ 
  vehicle, 
  onEdit, 
  selectable = false, 
  selected = false, 
  onSelect 
}: VehicleCardProps) {
  const batteryLevel = vehicle.currentBattery || 0;
  const batteryColor = batteryLevel > 50 ? "electric" : batteryLevel > 20 ? "yellow-500" : "red-500";

  return (
    <Card 
      className={cn(
        "bg-surface border-gray-700 cursor-pointer transition-all duration-200",
        selectable && selected && "border-electric border-2",
        selectable && "hover:border-electric/50"
      )}
      onClick={() => selectable && onSelect?.(vehicle)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-14 bg-gray-700 rounded-xl flex items-center justify-center">
            <span className="text-gray-400 text-xs">{vehicle.brand}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
              {!selectable && onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(vehicle);
                  }}
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              )}
              {selectable && selected && (
                <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
              )}
            </div>
            
            <div className="text-gray-400 text-sm mb-3">
              {vehicle.registrationNumber} • {vehicle.year} Model
            </div>
            
            <div className="bg-black p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4" />
                  <span className="text-sm">Battery</span>
                </div>
                <span className={cn("font-medium", `text-${batteryColor}`)}>
                  {batteryLevel}%
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div 
                  className={cn("h-full rounded-full", `bg-${batteryColor}`)}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                {batteryLevel < 30 && "Low Battery - Charge Soon"}
                {batteryLevel >= 30 && batteryLevel < 80 && `~${Math.round(batteryLevel * 4)} km range`}
                {batteryLevel >= 80 && `~${Math.round(batteryLevel * 4)} km range`}
              </div>
            </div>
            
            {vehicle.lastServiceDate && (
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-400">Last Service</span>
                <span>
                  {new Date(vehicle.lastServiceDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
