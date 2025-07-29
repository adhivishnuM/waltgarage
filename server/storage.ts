import { 
  type User, 
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type Service,
  type InsertService,
  type ServiceTracking,
  type InsertServiceTracking,
  type WalletTransaction,
  type InsertWalletTransaction,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Vehicle operations
  getVehiclesByUserId(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Service operations
  getServicesByUserId(userId: string): Promise<Service[]>;
  getActiveServiceByUserId(userId: string): Promise<Service | undefined>;
  getPendingServicesByPartnerId(partnerId?: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;

  // Service tracking operations
  getServiceTracking(serviceId: string): Promise<ServiceTracking | undefined>;
  createServiceTracking(tracking: InsertServiceTracking): Promise<ServiceTracking>;
  updateServiceTracking(serviceId: string, updates: Partial<ServiceTracking>): Promise<ServiceTracking | undefined>;

  // Wallet operations
  getWalletTransactionsByUserId(userId: string): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;

  // Notification operations
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private services: Map<string, Service>;
  private serviceTracking: Map<string, ServiceTracking>;
  private walletTransactions: Map<string, WalletTransaction>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.services = new Map();
    this.serviceTracking = new Map();
    this.walletTransactions = new Map();
    this.notifications = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "customer",
      walletBalance: insertUser.walletBalance ?? "0.00",
      profileImage: insertUser.profileImage ?? null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Vehicle operations
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.userId === userId);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { 
      ...insertVehicle,
      id,
      color: insertVehicle.color ?? null,
      batteryCapacity: insertVehicle.batteryCapacity ?? null,
      currentBattery: insertVehicle.currentBattery ?? 100,
      lastServiceDate: insertVehicle.lastServiceDate ?? null,
      createdAt: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Service operations
  async getServicesByUserId(userId: string): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(service => service.customerId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getActiveServiceByUserId(userId: string): Promise<Service | undefined> {
    return Array.from(this.services.values())
      .find(service => service.customerId === userId && 
                     (service.status === "assigned" || service.status === "in_progress"));
  }

  async getPendingServicesByPartnerId(partnerId?: string): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(service => service.status === "pending" && (!partnerId || service.partnerId === partnerId));
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      ...insertService,
      id,
      partnerId: insertService.partnerId ?? null,
      issueDescription: insertService.issueDescription ?? null,
      status: insertService.status ?? "pending",
      priority: insertService.priority ?? "normal",
      serviceLocation: insertService.serviceLocation ?? null,
      scheduledDate: insertService.scheduledDate ?? null,
      completedDate: insertService.completedDate ?? null,
      estimatedCost: insertService.estimatedCost ?? null,
      finalCost: insertService.finalCost ?? null,
      rating: insertService.rating ?? null,
      feedback: insertService.feedback ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates, updatedAt: new Date() };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Service tracking operations
  async getServiceTracking(serviceId: string): Promise<ServiceTracking | undefined> {
    return Array.from(this.serviceTracking.values()).find(tracking => tracking.serviceId === serviceId);
  }

  async createServiceTracking(insertTracking: InsertServiceTracking): Promise<ServiceTracking> {
    const id = randomUUID();
    const tracking: ServiceTracking = { 
      ...insertTracking,
      id,
      currentLocation: insertTracking.currentLocation ?? null,
      estimatedArrival: insertTracking.estimatedArrival ?? null,
      lastUpdated: new Date()
    };
    this.serviceTracking.set(id, tracking);
    return tracking;
  }

  async updateServiceTracking(serviceId: string, updates: Partial<ServiceTracking>): Promise<ServiceTracking | undefined> {
    const tracking = Array.from(this.serviceTracking.values()).find(t => t.serviceId === serviceId);
    if (!tracking) return undefined;
    
    const updatedTracking = { ...tracking, ...updates, lastUpdated: new Date() };
    this.serviceTracking.set(tracking.id, updatedTracking);
    return updatedTracking;
  }

  // Wallet operations
  async getWalletTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = randomUUID();
    const transaction: WalletTransaction = { 
      ...insertTransaction,
      id,
      serviceId: insertTransaction.serviceId ?? null,
      createdAt: new Date()
    };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification,
      id,
      data: insertNotification.data ?? null,
      isRead: insertNotification.isRead ?? false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
}

export const storage = new MemStorage();
