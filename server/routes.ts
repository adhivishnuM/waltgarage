import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVehicleSchema, 
  insertServiceSchema,
  insertServiceTrackingSchema,
  insertWalletTransactionSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to extract user ID from Firebase auth (mock for now)
  const getUserId = (req: any) => {
    // In a real implementation, this would extract the user ID from Firebase auth token
    return req.headers['x-user-id'] || 'user-1';
  };

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/users/stats", async (req, res) => {
    try {
      const userId = getUserId(req);
      const services = await storage.getServicesByUserId(userId);
      
      const completedServices = services.filter(s => s.status === "completed");
      const totalServices = completedServices.length;
      const savings = completedServices.reduce((sum, service) => {
        const cost = parseFloat(service.finalCost || service.estimatedCost || "0");
        return sum + (cost * 0.1); // Mock 10% savings
      }, 0);

      res.json({
        totalServices,
        savings: Math.round(savings),
        completedServices: totalServices
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const userId = getUserId(req);
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const updates = req.body;
      const vehicle = await storage.updateVehicle(req.params.id, updates);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const userId = getUserId(req);
      const services = await storage.getServicesByUserId(userId);
      
      // Populate with vehicle data
      const servicesWithVehicles = await Promise.all(
        services.map(async (service) => {
          const vehicle = await storage.getVehicle(service.vehicleId);
          return { ...service, vehicle };
        })
      );
      
      res.json(servicesWithVehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/recent", async (req, res) => {
    try {
      const userId = getUserId(req);
      const services = await storage.getServicesByUserId(userId);
      
      // Get recent services (last 5)
      const recentServices = services.slice(0, 5);
      
      // Populate with vehicle data
      const servicesWithVehicles = await Promise.all(
        recentServices.map(async (service) => {
          const vehicle = await storage.getVehicle(service.vehicleId);
          return { ...service, vehicle };
        })
      );
      
      res.json(servicesWithVehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent services" });
    }
  });

  app.get("/api/services/active", async (req, res) => {
    try {
      const userId = getUserId(req);
      const activeService = await storage.getActiveServiceByUserId(userId);
      
      if (!activeService) {
        return res.json(null);
      }

      // Populate with vehicle data
      const vehicle = await storage.getVehicle(activeService.vehicleId);
      res.json({ ...activeService, vehicle });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active service" });
    }
  });

  app.get("/api/services/pending", async (req, res) => {
    try {
      const partnerId = req.query.partnerId as string;
      const pendingServices = await storage.getPendingServicesByPartnerId(partnerId);
      
      // Populate with vehicle and customer data
      const servicesWithDetails = await Promise.all(
        pendingServices.map(async (service) => {
          const vehicle = await storage.getVehicle(service.vehicleId);
          const customer = await storage.getUser(service.customerId);
          return { ...service, vehicle, customer };
        })
      );
      
      res.json(servicesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Populate with vehicle data
      const vehicle = await storage.getVehicle(service.vehicleId);
      res.json({ ...service, vehicle });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const userId = getUserId(req);
      const serviceData = insertServiceSchema.parse({
        ...req.body,
        customerId: userId,
        estimatedCost: "850.00" // Default estimated cost
      });
      
      const service = await storage.createService(serviceData);
      
      // Create notification for service creation
      await storage.createNotification({
        userId,
        title: "Service Booked",
        message: "Your service has been booked successfully. We'll find a technician for you.",
        type: "service_update"
      });
      
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.post("/api/services/:id/accept", async (req, res) => {
    try {
      const partnerId = getUserId(req);
      const service = await storage.updateService(req.params.id, {
        partnerId,
        status: "assigned"
      });
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Create service tracking
      await storage.createServiceTracking({
        serviceId: service.id,
        partnerId,
        currentLocation: { lat: 19.0760, lng: 72.8777 }, // Mock Mumbai location
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        status: "on_way"
      });

      // Notify customer
      await storage.createNotification({
        userId: service.customerId,
        title: "Technician Assigned",
        message: "A technician has been assigned to your service. They are on their way!",
        type: "service_update"
      });

      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept service" });
    }
  });

  app.post("/api/services/:id/decline", async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, {
        status: "pending" // Keep as pending for other partners
      });
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to decline service" });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const updates = req.body;
      const service = await storage.updateService(req.params.id, updates);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  // Service tracking routes
  app.get("/api/services/:id/tracking", async (req, res) => {
    try {
      const tracking = await storage.getServiceTracking(req.params.id);
      if (!tracking) {
        return res.status(404).json({ message: "Tracking not found" });
      }
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracking" });
    }
  });

  app.post("/api/services/:id/tracking", async (req, res) => {
    try {
      const trackingData = insertServiceTrackingSchema.parse({
        ...req.body,
        serviceId: req.params.id
      });
      
      const tracking = await storage.createServiceTracking(trackingData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tracking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tracking" });
    }
  });

  app.patch("/api/services/:id/tracking", async (req, res) => {
    try {
      const updates = req.body;
      const tracking = await storage.updateServiceTracking(req.params.id, updates);
      if (!tracking) {
        return res.status(404).json({ message: "Tracking not found" });
      }
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tracking" });
    }
  });

  // Partner routes
  app.get("/api/partners/stats", async (req, res) => {
    try {
      const partnerId = getUserId(req);
      const services = await storage.getServicesByUserId(partnerId);
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayServices = services.filter(s => 
        new Date(s.createdAt || 0) >= todayStart && s.status === "completed"
      );
      
      const todayEarnings = todayServices.reduce((sum, service) => {
        return sum + parseFloat(service.finalCost || service.estimatedCost || "0");
      }, 0);

      res.json({
        todayEarnings: Math.round(todayEarnings),
        completedServices: todayServices.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner stats" });
    }
  });

  // Wallet routes
  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const userId = getUserId(req);
      const transactions = await storage.getWalletTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/wallet/transactions", async (req, res) => {
    try {
      const userId = getUserId(req);
      const transactionData = insertWalletTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      const transaction = await storage.createWalletTransaction(transactionData);
      
      // Update user wallet balance
      const user = await storage.getUser(userId);
      if (user) {
        const currentBalance = parseFloat(user.walletBalance || "0");
        const amount = parseFloat(transactionData.amount);
        const newBalance = transactionData.type === "credit" ? 
          currentBalance + amount : currentBalance - amount;
        
        await storage.updateUser(userId, {
          walletBalance: newBalance.toFixed(2)
        });
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = getUserId(req);
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Emergency service route
  app.post("/api/emergency", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { location, vehicleId, description } = req.body;
      
      // Create emergency service with high priority
      const service = await storage.createService({
        customerId: userId,
        vehicleId,
        serviceType: "emergency",
        issueDescription: description,
        status: "pending",
        priority: "emergency",
        serviceLocation: location,
        estimatedCost: "1500.00" // Higher cost for emergency
      });

      // Send urgent notification
      await storage.createNotification({
        userId,
        title: "Emergency Service Requested",
        message: "Your emergency service request has been received. A technician will contact you shortly.",
        type: "service_update"
      });

      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create emergency service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
