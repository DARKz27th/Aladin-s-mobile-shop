import { Link } from "wouter";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getLoginUrl } from "@/const";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-700" },
  processing: { label: "กำลังดำเนินการ", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "จัดส่งแล้ว", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-700" },
};

export default function OrderHistory() {
  const { isAuthenticated, loading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-48 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center bg-white rounded-2xl border border-border/60 p-10 max-w-sm w-full mx-4">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เข้าสู่ระบบก่อน</h2>
          <p className="text-muted-foreground text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">ประวัติคำสั่งซื้อ</h1>
          <p className="text-muted-foreground mt-1">รายการคำสั่งซื้อทั้งหมดของคุณ</p>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="bg-white rounded-2xl border border-border/60 p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">ยังไม่มีคำสั่งซื้อ</h3>
            <p className="text-sm text-muted-foreground mb-6">เริ่มต้นช้อปปิ้งอะไหล่มือถือได้เลย</p>
            <Button asChild>
              <Link href="/products">ดูสินค้าทั้งหมด</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const sc = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-border/60 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-foreground">คำสั่งซื้อ #{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <Badge className={`text-xs ${sc.color}`} variant="secondary">
                      {sc.label}
                    </Badge>
                  </div>

                  {order.items?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-medium shrink-0">
                            {formatPrice(parseFloat(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{order.items.length - 3} รายการเพิ่มเติม</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div>
                      <p className="text-xs text-muted-foreground">ยอดรวม</p>
                      <p className="font-bold text-primary text-lg">{formatPrice(parseFloat(order.total))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">วิธีชำระ</p>
                      <p className="text-sm font-medium text-foreground">{order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
