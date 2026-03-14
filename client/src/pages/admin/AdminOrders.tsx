import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const ORDER_STATUSES = [
  { value: "pending", label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-700" },
  { value: "confirmed", label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "กำลังดำเนินการ", color: "bg-purple-100 text-purple-700" },
  { value: "shipped", label: "จัดส่งแล้ว", color: "bg-indigo-100 text-indigo-700" },
  { value: "completed", label: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "ยกเลิก", color: "bg-red-100 text-red-700" },
];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.allOrders.useQuery();

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.allOrders.invalidate();
      toast.success("อัปเดตสถานะสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifySlipMutation = trpc.orders.verifySlip.useMutation({
    onSuccess: () => {
      utils.orders.allOrders.invalidate();
      toast.success("ยืนยันสลิปสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = (orders ?? []).filter(
    (o: any) =>
      !search ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
  );

  const getStatusConfig = (status: string) =>
    ORDER_STATUSES.find((s) => s.value === status) ?? { label: status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการคำสั่งซื้อ</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} รายการ</p>
          </div>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาด้วยชื่อหรือหมายเลขคำสั่งซื้อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ลูกค้า</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ยอด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ชำระเงิน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">สถานะ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">วันที่</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-4 py-4" colSpan={7}>
                          <div className="h-6 bg-secondary rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((order: any) => {
                      const sc = getStatusConfig(order.status);
                      return (
                        <tr key={order.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">#{order.id}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-primary text-sm">{formatPrice(parseFloat(order.total))}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground">{order.paymentMethod}</span>
                              {order.paymentSlipUrl && (
                                <div className="flex gap-1">
                                  {order.paymentStatus === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs px-2 text-green-600 border-green-200"
                                        onClick={() => verifySlipMutation.mutate({ orderId: order.id, status: "verified" })}
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> ยืนยัน
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs px-2 text-red-600 border-red-200"
                                        onClick={() => verifySlipMutation.mutate({ orderId: order.id, status: "rejected" })}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" /> ปฏิเสธ
                                      </Button>
                                    </>
                                  )}
                                  {order.paymentStatus === "verified" && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">ยืนยันแล้ว</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={order.status}
                              onValueChange={(v) => updateStatusMutation.mutate({ id: order.id, status: v })}
                            >
                              <SelectTrigger className={`h-7 text-xs w-36 ${sc.color} border-0`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map((s) => (
                                  <SelectItem key={s.value} value={s.value} className="text-xs">
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>คำสั่งซื้อ #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">ชื่อลูกค้า</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">เบอร์โทร</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                {selectedOrder.customerEmail && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">อีเมล</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                )}
                {selectedOrder.address && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">ที่อยู่</p>
                    <p className="font-medium">{selectedOrder.address}</p>
                  </div>
                )}
              </div>
              {selectedOrder.paymentSlipUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">สลิปการโอนเงิน</p>
                  <img
                    src={selectedOrder.paymentSlipUrl}
                    alt="payment slip"
                    className="max-h-48 rounded-xl object-contain border border-border"
                  />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-2">รายการสินค้า</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-3 pt-3 border-t border-border">
                  <span>รวม</span>
                  <span className="text-primary">{formatPrice(parseFloat(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
