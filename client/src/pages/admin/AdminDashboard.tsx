import { Link } from "wouter";
import {
  ShoppingBag,
  Wrench,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-700" },
  processing: { label: "กำลังดำเนินการ", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "จัดส่งแล้ว", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-700" },
  received: { label: "รับเครื่องแล้ว", color: "bg-blue-100 text-blue-700" },
  diagnosing: { label: "กำลังตรวจสอบ", color: "bg-yellow-100 text-yellow-700" },
  repairing: { label: "กำลังซ่อม", color: "bg-orange-100 text-orange-700" },
  waiting_parts: { label: "รออะไหล่", color: "bg-purple-100 text-purple-700" },
  ready_pickup: { label: "รอรับเครื่อง", color: "bg-teal-100 text-teal-700" },
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: recentOrders } = trpc.admin.recentOrders.useQuery();
  const { data: recentRepairs } = trpc.admin.recentRepairs.useQuery();

  const statCards = [
    {
      title: "คำสั่งซื้อทั้งหมด",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${stats?.pendingOrders ?? 0} รอดำเนินการ`,
    },
    {
      title: "งานซ่อมทั้งหมด",
      value: stats?.totalRepairs ?? 0,
      icon: Wrench,
      color: "text-orange-600",
      bg: "bg-orange-50",
      sub: `${stats?.activeRepairs ?? 0} กำลังซ่อม`,
    },
    {
      title: "สินค้าทั้งหมด",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: `${stats?.lowStockProducts ?? 0} สินค้าใกล้หมด`,
    },
    {
      title: "ลูกค้าทั้งหมด",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      sub: "ผู้ใช้ที่ลงทะเบียน",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">ภาพรวมระบบ AladinMobile</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">
                <Package className="w-4 h-4 mr-1.5" /> จัดการสินค้า
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/repairs">
                <Wrench className="w-4 h-4 mr-1.5" /> จัดการซ่อม
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-5">
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{card.value.toLocaleString()}</div>
                    <div className="text-sm font-medium text-foreground">{card.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">คำสั่งซื้อล่าสุด</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                  <Link href="/admin/orders">
                    ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">#{order.id} - {order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatPrice(parseFloat(order.total))}</p>
                      <Badge
                        className={`text-xs mt-0.5 ${STATUS_LABELS[order.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                        variant="secondary"
                      >
                        {STATUS_LABELS[order.status]?.label ?? order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!recentOrders?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีคำสั่งซื้อ</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Repairs */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">งานซ่อมล่าสุด</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                  <Link href="/admin/repairs">
                    ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRepairs?.slice(0, 5).map((repair: any) => (
                  <div key={repair.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{repair.repairCode}</p>
                      <p className="text-xs text-muted-foreground">{repair.customerName} · {repair.brand} {repair.model}</p>
                    </div>
                    <Badge
                      className={`text-xs ${STATUS_LABELS[repair.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                      variant="secondary"
                    >
                      {STATUS_LABELS[repair.status]?.label ?? repair.status}
                    </Badge>
                  </div>
                ))}
                {!recentRepairs?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีงานซ่อม</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/products/new", label: "เพิ่มสินค้า", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
            { href: "/admin/orders", label: "จัดการคำสั่งซื้อ", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/admin/repairs", label: "จัดการซ่อม", icon: Wrench, color: "text-orange-600", bg: "bg-orange-50" },
            { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users, color: "text-green-600", bg: "bg-green-50" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="bg-white rounded-xl border border-border/60 p-4 hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center mb-3`}>
                  <action.icon className={`w-4.5 h-4.5 ${action.color}`} />
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
