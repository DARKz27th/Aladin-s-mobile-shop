import { Link } from "wouter";
import { User, ShoppingBag, Wrench, LogOut, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-48 h-8" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center bg-white rounded-2xl border border-border/60 p-10 max-w-sm w-full mx-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เข้าสู่ระบบก่อน</h2>
          <p className="text-muted-foreground text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: "/orders",
      icon: ShoppingBag,
      label: "ประวัติคำสั่งซื้อ",
      desc: "ดูรายการสั่งซื้ออะไหล่ทั้งหมด",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      href: "/repair-history",
      icon: Wrench,
      label: "ประวัติการซ่อม",
      desc: "ดูรายการจองซ่อมทั้งหมด",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    ...(user.role === "admin"
      ? [
          {
            href: "/admin",
            icon: Shield,
            label: "Admin Dashboard",
            desc: "จัดการระบบหลังบ้าน",
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">โปรไฟล์</h1>
        </div>
      </div>

      <div className="container py-8 max-w-lg">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-border/60 p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{user.name ?? "ผู้ใช้งาน"}</h2>
                {user.role === "admin" && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">Admin</Badge>
                )}
              </div>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                เข้าสู่ระบบผ่าน {user.loginMethod ?? "Manus"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden mb-5">
          {menuItems.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${i > 0 ? "border-t border-border/60" : ""}`}>
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
