import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module to avoid real DB calls in tests
vi.mock("./db", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "หน้าจอ", slug: "screen" },
    { id: 2, name: "แบตเตอรี่", slug: "battery" },
  ]),
  getProducts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getProductById: vi.fn().mockResolvedValue(null),
  createProduct: vi.fn().mockResolvedValue(1),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(1),
  getOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  uploadPaymentSlip: vi.fn().mockResolvedValue(undefined),
  verifyPaymentSlip: vi.fn().mockResolvedValue(undefined),
  createRepairBooking: vi.fn().mockResolvedValue("REP-TEST-001"),
  getRepairBookings: vi.fn().mockResolvedValue([]),
  getRepairByCode: vi.fn().mockResolvedValue(null),
  getRepairByPhone: vi.fn().mockResolvedValue([]),
  updateRepairStatus: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalOrders: 5,
    totalRepairs: 3,
    totalRevenue: 15000,
    pendingOrders: 2,
    pendingRepairs: 1,
    totalProducts: 20,
    lowStockProducts: 2,
    totalUsers: 10,
    activeRepairs: 1,
  }),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "user-001",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "admin-001",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user object for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
    expect(result?.role).toBe("user");
  });
});

// ─── Categories Tests ──────────────────────────────────────────────────────────

describe("categories.list", () => {
  it("returns list of categories", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("หน้าจอ");
  });
});

// ─── Products Tests ────────────────────────────────────────────────────────────

describe("products.list", () => {
  it("returns paginated products", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.products.list({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });
});

// ─── Repair Booking Tests ──────────────────────────────────────────────────────

describe("repairs.book", () => {
  it("creates a repair booking and returns repairCode", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.repairs.book({
      customerName: "สมชาย ใจดี",
      phone: "0812345678",
      brand: "Apple",
      model: "iPhone 14",
      issue: "หน้าจอแตก ต้องการเปลี่ยน",
      bookingDate: "2026-03-20",
      bookingTime: "10:00",
    });
    expect(result).toHaveProperty("repairCode");
    expect(result.repairCode).toBe("REP-TEST-001");
  });

  it("rejects booking with too-short issue description", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.repairs.book({
        customerName: "สมชาย",
        phone: "0812345678",
        brand: "Apple",
        model: "iPhone 14",
        issue: "เสีย", // too short (< 5 chars)
        bookingDate: "2026-03-20",
        bookingTime: "10:00",
      })
    ).rejects.toThrow();
  });
});

// ─── Admin Tests ───────────────────────────────────────────────────────────────

describe("admin.stats", () => {
  it("returns stats for admin user", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.admin.stats();
    expect(result.totalOrders).toBe(5);
    expect(result.totalRepairs).toBe(3);
    expect(result.totalProducts).toBe(20);
    expect(result.totalUsers).toBe(10);
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow("Admin access required");
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

describe("orders.allOrders", () => {
  it("returns all orders for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.orders.allOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.orders.allOrders()).rejects.toThrow("Admin access required");
  });
});
