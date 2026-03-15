import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { vehicleTypesTable } from "./vehicleTypes";

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  fuelType: text("fuel_type").notNull(),
  status: text("status").notNull().default("Active"),
  mileageKm: integer("mileage_km").notNull().default(0),
  vehicleTypeId: integer("vehicle_type_id").notNull().references(() => vehicleTypesTable.id),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
