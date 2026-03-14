import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertProduct,
  InsertRepairBooking,
  categories,
  orderItems,
  orders,
  payments,
  products,
  repairBookings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "phone"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  search?: string;
  brand?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(products.isActive, true)];
  if (opts?.search) {
    conditions.push(
      or(
        like(products.name, `%${opts.search}%`),
        like(products.brand, `%${opts.search}%`),
        like(products.model, `%${opts.search}%`)
      )!
    );
  }
  if (opts?.brand) conditions.push(eq(products.brand, opts.brand));
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));

  const where = and(...conditions);
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  const [items, countResult] = await Promise.all([
    db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(
  orderData: {
    userId?: number;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    total: string;
    paymentMethod: "transfer" | "visa" | "messenger";
    address?: string;
    note?: string;
  },
  items: Array<{ productId: number; productName: string; price: string; quantity: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const [result] = await db.insert(orders).values(orderData).$returningId();
  const orderId = result.id;

  if (items.length > 0) {
    await db.insert(orderItems).values(items.map((item) => ({ ...item, orderId })));
  }

  // Create payment record
  await db.insert(payments).values({ orderId, paymentStatus: "pending" });

  return orderId;
}

export async function getOrders(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = userId ? eq(orders.userId, userId) : undefined;
  return db.select().from(orders).where(where).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, id)).limit(1);
  return { ...order, items, payment };
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function uploadPaymentSlip(orderId: number, slipImageUrl: string, slipImageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(payments)
    .set({ slipImageUrl, slipImageKey, paymentStatus: "submitted" })
    .where(eq(payments.orderId, orderId));
}

export async function verifyPaymentSlip(orderId: number, status: "verified" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(payments)
    .set({ paymentStatus: status, verifiedAt: status === "verified" ? new Date() : null })
    .where(eq(payments.orderId, orderId));
  if (status === "verified") {
    await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
  }
}

// ─── Repair Bookings ─────────────────────────────────────────────────────────

function generateRepairCode(): string {
  const prefix = "REP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createRepairBooking(data: Omit<InsertRepairBooking, "repairCode">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const repairCode = generateRepairCode();
  await db.insert(repairBookings).values({ ...data, repairCode });
  return repairCode;
}

export async function getRepairBookings(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = userId ? eq(repairBookings.userId, userId) : undefined;
  return db.select().from(repairBookings).where(where).orderBy(desc(repairBookings.createdAt));
}

export async function getRepairByCode(repairCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(repairBookings)
    .where(eq(repairBookings.repairCode, repairCode))
    .limit(1);
  return result[0];
}

export async function getRepairByPhone(phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(repairBookings)
    .where(eq(repairBookings.phone, phone))
    .orderBy(desc(repairBookings.createdAt));
}

export async function updateRepairStatus(
  id: number,
  status: string,
  technicianNote?: string,
  estimatedCost?: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: Record<string, unknown> = { status };
  if (technicianNote !== undefined) updateData.technicianNote = technicianNote;
  if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
  await db.update(repairBookings).set(updateData as any).where(eq(repairBookings.id, id));
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRepairs: 0, totalRevenue: 0, pendingOrders: 0, pendingRepairs: 0, totalProducts: 0, lowStockProducts: 0, totalUsers: 0, activeRepairs: 0 };

  const [orderStats, repairStats, revenueStats] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(repairBookings),
    db
      .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed")),
  ]);

  const [pendingOrders, pendingRepairs, productStats, lowStock, userStats, activeRepairsStats] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(repairBookings).where(eq(repairBookings.status, "received")),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(products).where(sql`stock <= 3 AND stock > 0`),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(repairBookings).where(sql`status IN ('repairing','diagnosing','waiting_parts')`),
  ]);

  return {
    totalOrders: Number(orderStats[0]?.count ?? 0),
    totalRepairs: Number(repairStats[0]?.count ?? 0),
    totalRevenue: Number(revenueStats[0]?.total ?? 0),
    pendingOrders: Number(pendingOrders[0]?.count ?? 0),
    pendingRepairs: Number(pendingRepairs[0]?.count ?? 0),
    totalProducts: Number(productStats[0]?.count ?? 0),
    lowStockProducts: Number(lowStock[0]?.count ?? 0),
    totalUsers: Number(userStats[0]?.count ?? 0),
    activeRepairs: Number(activeRepairsStats[0]?.count ?? 0),
  };
}
