import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { VehicleCard } from "@/components/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Vehicle, InsertVehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const EV_BRANDS = [
  "Tata",
  "MG",
  "Hyundai",
  "Mahindra",
  "BYD",
  "Ola Electric",
  "Ather",
  "TVS",
  "Bajaj",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function Vehicles() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertVehicle>>({
    brand: "",
    model: "",
    registrationNumber: "",
    year: CURRENT_YEAR,
    color: "",
    batteryCapacity: 0,
    currentBattery: 100,
  });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: !!userData,
  });

  const addVehicleMutation = useMutation({
    mutationFn: async (vehicleData: InsertVehicle) => {
      return apiRequest("POST", "/api/vehicles", vehicleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setShowAddModal(false);
      setFormData({
        brand: "",
        model: "",
        registrationNumber: "",
        year: CURRENT_YEAR,
        color: "",
        batteryCapacity: 0,
        currentBattery: 100,
      });
      toast({
        title: "Vehicle added successfully!",
        description: "Your vehicle has been registered.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add vehicle",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData && formData.brand && formData.model && formData.registrationNumber) {
      addVehicleMutation.mutate({
        ...formData,
        userId: userData.id,
      } as InsertVehicle);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black px-6 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Vehicles</h1>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-10 h-10 bg-electric text-black rounded-xl p-0">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add Vehicle</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="brand">Vehicle Brand</Label>
                  <Select 
                    value={formData.brand} 
                    onValueChange={(value) => setFormData({...formData, brand: value})}
                  >
                    <SelectTrigger className="bg-black border-gray-600">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-gray-700">
                      {EV_BRANDS.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., Nexon EV"
                    className="bg-black border-gray-600"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                    placeholder="MH 02 AB 1234"
                    className="bg-black border-gray-600"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={formData.year?.toString()} 
                    onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-black border-gray-600">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-gray-700">
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color || ""}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="e.g., Metallic Blue"
                    className="bg-black border-gray-600"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addVehicleMutation.isPending}
                    className="flex-1 bg-electric text-black"
                  >
                    {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {((vehicles as any) || []).map((vehicle: Vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={(vehicle) => {
                // TODO: Implement edit functionality
                console.log("Edit vehicle:", vehicle);
              }}
            />
          ))}

          {((vehicles as any) || []).length === 0 && (
            <Card className="bg-surface border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">No vehicles registered</div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-electric text-black"
                >
                  Add Your First Vehicle
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Vehicle Button */}
          <Button 
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="w-full bg-surface border-2 border-dashed border-gray-600 p-8 rounded-2xl text-center hover:border-electric h-auto"
          >
            <div className="flex flex-col items-center">
              <Plus className="w-8 h-8 text-electric mb-3" />
              <div className="font-semibold">Add New Vehicle</div>
              <div className="text-gray-400 text-sm">Register your EV for service</div>
            </div>
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
