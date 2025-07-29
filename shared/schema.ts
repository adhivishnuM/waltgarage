import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer, partner, admin
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  year: integer("year").notNull(),
  color: text("color"),
  batteryCapacity: integer("battery_capacity"), // in kWh
  currentBattery: integer("current_battery").default(100), // percentage
  lastServiceDate: timestamp("last_service_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  partnerId: varchar("partner_id").references(() => users.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  serviceType: text("service_type").notNull(), // battery, charging_port, motor, diagnostics, etc.
  issueDescription: text("issue_description"),
  status: text("status").notNull().default("pending"), // pending, assigned, in_progress, completed, cancelled
  priority: text("priority").default("normal"), // normal, urgent, emergency
  serviceLocation: jsonb("service_location"), // {address, lat, lng}
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceTracking = pgTable("service_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  partnerId: varchar("partner_id").references(() => users.id).notNull(),
  currentLocation: jsonb("current_location"), // {lat, lng}
  estimatedArrival: timestamp("estimated_arrival"),
  status: text("status").notNull(), // on_way, arrived, working, completed
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // credit, debit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // service_update, payment, promotion, system
  isRead: boolean("is_read").default(false),
  data: jsonb("data"), // additional notification data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceTrackingSchema = createInsertSchema(serviceTracking).omit({
  id: true,
  lastUpdated: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ServiceTracking = typeof serviceTracking.$inferSelect;
export type InsertServiceTracking = z.infer<typeof insertServiceTrackingSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
