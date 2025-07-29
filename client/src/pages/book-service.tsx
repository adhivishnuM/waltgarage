import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { VehicleCard } from "@/components/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { Vehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BOOKING_STEPS = {
  VEHICLE_SELECTION: 1,
  ISSUE_SELECTION: 2,
  LOCATION_CONFIRMATION: 3,
  SCHEDULING: 4,
};

const SERVICE_TYPES = [
  { id: "battery", name: "Battery Service", description: "Battery diagnostics and repair" },
  { id: "charging_port", name: "Charging Port", description: "Charging port issues" },
  { id: "motor", name: "Motor Service", description: "Motor diagnostics and maintenance" },
  { id: "diagnostics", name: "Full Diagnostics", description: "Complete vehicle checkup" },
  { id: "software", name: "Software Update", description: "System and software updates" },
];

export default function BookService() {
  const [, setLocation] = useWouterLocation();
  const { userData } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.VEHICLE_SELECTION);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState("");

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: !!userData,
  });

  const bookServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      return apiRequest("POST", "/api/services", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service booked successfully!",
        description: "You will receive updates on your service status.",
      });
      setLocation("/track");
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Book the service
      if (selectedVehicle && selectedServiceType) {
        bookServiceMutation.mutate({
          vehicleId: selectedVehicle.id,
          serviceType: selectedServiceType,
          issueDescription,
          serviceLocation: {
            address: "Current Location",
            lat: location.latitude,
            lng: location.longitude,
          },
        });
      }
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case BOOKING_STEPS.VEHICLE_SELECTION:
        return selectedVehicle !== null;
      case BOOKING_STEPS.ISSUE_SELECTION:
        return selectedServiceType !== "";
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case BOOKING_STEPS.VEHICLE_SELECTION:
        return "Select Your Vehicle";
      case BOOKING_STEPS.ISSUE_SELECTION:
        return "What's the Issue?";
      case BOOKING_STEPS.LOCATION_CONFIRMATION:
        return "Confirm Location";
      case BOOKING_STEPS.SCHEDULING:
        return "Schedule Service";
      default:
        return "Book Service";
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black px-6 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setLocation("/home")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Book Service</h1>
            <div className="text-sm text-gray-400">Step {currentStep} of 4</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="px-6">
        <h2 className="text-xl font-semibold mb-6">{getStepTitle()}</h2>

        {/* Vehicle Selection */}
        {currentStep === BOOKING_STEPS.VEHICLE_SELECTION && (
          <div className="space-y-4">
            {((vehicles as any) || []).map((vehicle: Vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                selectable
                selected={selectedVehicle?.id === vehicle.id}
                onSelect={setSelectedVehicle}
              />
            ))}

            <Link href="/vehicles/add">
              <Button 
                variant="outline"
                className="w-full bg-surface border-2 border-dashed border-gray-600 p-6 rounded-2xl text-center hover:border-electric h-auto"
              >
                <div className="flex flex-col items-center">
                  <Plus className="w-8 h-8 text-electric mb-2" />
                  <div className="font-medium">Add New Vehicle</div>
                  <div className="text-gray-400 text-sm">Register your EV</div>
                </div>
              </Button>
            </Link>
          </div>
        )}

        {/* Issue Selection */}
        {currentStep === BOOKING_STEPS.ISSUE_SELECTION && (
          <div className="space-y-4">
            {SERVICE_TYPES.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedServiceType === service.id
                    ? "bg-electric/10 border-electric"
                    : "bg-surface border-gray-700 hover:border-electric/50"
                }`}
                onClick={() => setSelectedServiceType(service.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-gray-400 text-sm">{service.description}</div>
                    </div>
                    {selectedServiceType === service.id && (
                      <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-full" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full bg-surface border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Location Confirmation */}
        {currentStep === BOOKING_STEPS.LOCATION_CONFIRMATION && (
          <div>
            <Card className="bg-surface border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-electric" />
                  <div className="flex-1">
                    <div className="font-medium">Current Location</div>
                    <div className="text-gray-400 text-sm">
                      {location.latitude && location.longitude
                        ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                        : "Loading location..."}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-electric">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scheduling */}
        {currentStep === BOOKING_STEPS.SCHEDULING && (
          <div className="space-y-6">
            <Card className="bg-surface border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Service Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vehicle</span>
                    <span>{selectedVehicle?.brand} {selectedVehicle?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service</span>
                    <span>{SERVICE_TYPES.find(s => s.id === selectedServiceType)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span>Current Location</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Estimated Cost</span>
                    <span className="text-electric">₹850</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-700">
              <CardContent className="p-4">
                <div className="text-sm text-blue-200">
                  <strong>Note:</strong> Our technician will arrive within 30-45 minutes. 
                  You'll receive real-time updates and can track their location.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <Button 
          onClick={handleContinue}
          disabled={!canContinue() || bookServiceMutation.isPending}
          className="w-full bg-electric text-black font-semibold py-4 rounded-2xl"
        >
          {bookServiceMutation.isPending ? "Booking..." : 
           currentStep === 4 ? "Book Service" : "Continue"}
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
