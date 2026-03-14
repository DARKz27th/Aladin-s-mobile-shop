import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  uploadPaymentSlip,
  verifyPaymentSlip,
  createRepairBooking,
  getRepairBookings,
  getRepairByCode,
  getRepairByPhone,
  updateRepairStatus,
  getDashboardStats,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Categories ────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getCategories()),
  }),

  // ─── Products ──────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          brand: z.string().optional(),
          categoryId: z.number().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ input }) => getProducts(input)),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          categoryId: z.number().optional(),
          price: z.string(),
          stock: z.number().min(0),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createProduct(input as any);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          categoryId: z.number().optional(),
          price: z.string().optional(),
          stock: z.number().min(0).optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data as any);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ─── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().min(9),
          total: z.string(),
          paymentMethod: z.enum(["transfer", "visa", "messenger"]),
          address: z.string().optional(),
          note: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              price: z.string(),
              quantity: z.number().min(1),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { items, ...orderData } = input;
        const orderId = await createOrder(
          { ...orderData, userId: ctx.user?.id },
          items
        );
        // Notify owner
        await notifyOwner({
          title: "คำสั่งซื้อใหม่",
          content: `ลูกค้า: ${input.customerName} | ยอด: ฿${input.total} | วิธีชำระ: ${input.paymentMethod}`,
        }).catch(() => {});
        return { orderId };
      }),

    myOrders: protectedProcedure.query(({ ctx }) => getOrders(ctx.user.id)),

    allOrders: adminProcedure.query(() => getOrders()),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return order;
      }),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        return { success: true };
      }),

    uploadSlip: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          imageBase64: z.string(),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const key = `payment-slips/${input.orderId}-${nanoid(8)}.jpg`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await uploadPaymentSlip(input.orderId, url, key);
        return { success: true, url };
      }),

    verifySlip: adminProcedure
      .input(z.object({ orderId: z.number(), status: z.enum(["verified", "rejected"]) }))
      .mutation(async ({ input }) => {
        await verifyPaymentSlip(input.orderId, input.status);
        return { success: true };
      }),
  }),

  // ─── Repair Bookings ───────────────────────────────────────────────────────
  repairs: router({
    book: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          phone: z.string().min(9),
          brand: z.string().min(1),
          model: z.string().min(1),
          issue: z.string().min(5),
          bookingDate: z.string(),
          bookingTime: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const repairCode = await createRepairBooking({
          ...input,
          userId: ctx.user?.id,
        });
        await notifyOwner({
          title: "จองซ่อมใหม่",
          content: `ลูกค้า: ${input.customerName} | โทร: ${input.phone} | ${input.brand} ${input.model} | อาการ: ${input.issue}`,
        }).catch(() => {});
        return { repairCode };
      }),

    trackByCode: publicProcedure
      .input(z.object({ repairCode: z.string() }))
      .query(async ({ input }) => {
        const repair = await getRepairByCode(input.repairCode);
        if (!repair) throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบรหัสซ่อมนี้" });
        return repair;
      }),

    trackByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(({ input }) => getRepairByPhone(input.phone)),

    myRepairs: protectedProcedure.query(({ ctx }) => getRepairBookings(ctx.user.id)),

    allRepairs: adminProcedure.query(() => getRepairBookings()),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.string(),
          technicianNote: z.string().optional(),
          estimatedCost: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateRepairStatus(input.id, input.status, input.technicianNote, input.estimatedCost);
        return { success: true };
      }),
  }),

  // ─── Admin Dashboard ───────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(() => getDashboardStats()),
    recentOrders: adminProcedure.query(() => getOrders()),
    recentRepairs: adminProcedure.query(() => getRepairBookings()),
  }),
});

export type AppRouter = typeof appRouter;
