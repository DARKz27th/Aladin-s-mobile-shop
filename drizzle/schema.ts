import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  categoryId: int("categoryId"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0).notNull(),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["transfer", "visa", "messenger"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "completed", "cancelled"]).default("pending").notNull(),
  address: text("address"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().unique(),
  slipImageUrl: text("slipImageUrl"),
  slipImageKey: text("slipImageKey"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "submitted", "verified", "rejected"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const repairBookings = mysqlTable("repair_bookings", {
  id: int("id").autoincrement().primaryKey(),
  repairCode: varchar("repairCode", { length: 20 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  issue: text("issue").notNull(),
  bookingDate: varchar("bookingDate", { length: 20 }).notNull(),
  bookingTime: varchar("bookingTime", { length: 10 }).notNull(),
  status: mysqlEnum("status", [
    "received",
    "diagnosing",
    "repairing",
    "waiting_parts",
    "completed",
    "ready_pickup",
    "cancelled",
  ]).default("received").notNull(),
  technicianNote: text("technicianNote"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type RepairBooking = typeof repairBookings.$inferSelect;
export type InsertRepairBooking = typeof repairBookings.$inferInsert;
export type Payment = typeof payments.$inferSelect;
