import { Link } from "wouter";
import { Wrench, CheckCircle2, Clock, Package, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDateTime } from "@/lib/utils";
import { getLoginUrl } from "@/const";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  received: { label: "รับเครื่องแล้ว", color: "bg-blue-100 text-blue-700", icon: Package },
  diagnosing: { label: "กำลังตรวจสอบ", color: "bg-yellow-100 text-yellow-700", icon: Search },
  repairing: { label: "กำลังซ่อม", color: "bg-orange-100 text-orange-700", icon: Wrench },
  waiting_parts: { label: "รออะไหล่", color: "bg-purple-100 text-purple-700", icon: Clock },
  completed: { label: "ซ่อมเสร็จแล้ว", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  ready_pickup: { label: "รอรับเครื่อง", color: "bg-teal-100 text-teal-700", icon: CheckCircle2 },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function RepairHistory() {
  const { isAuthenticated, loading } = useAuth();
  const { data: repairs, isLoading } = trpc.repairs.myRepairs.useQuery(undefined, {
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
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เข้าสู่ระบบก่อน</h2>
          <p className="text-muted-foreground text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อดูประวัติการซ่อม</p>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">ประวัติการซ่อม</h1>
          <p className="text-muted-foreground mt-1">รายการจองซ่อมทั้งหมดของคุณ</p>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : !repairs?.length ? (
          <div className="bg-white rounded-2xl border border-border/60 p-12 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">ยังไม่มีประวัติการซ่อม</h3>
            <p className="text-sm text-muted-foreground mb-6">จองคิวซ่อมมือถือได้ทันที</p>
            <Button asChild>
              <Link href="/repair-booking">จองคิวซ่อม</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {repairs.map((repair: any) => {
              const sc = STATUS_CONFIG[repair.status] ?? { label: repair.status, color: "bg-gray-100 text-gray-700", icon: Wrench };
              const StatusIcon = sc.icon;
              return (
                <div key={repair.id} className="bg-white rounded-2xl border border-border/60 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono font-bold text-foreground text-lg tracking-wider">{repair.repairCode}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(repair.createdAt)}</p>
                    </div>
                    <Badge className={`text-xs ${sc.color}`} variant="secondary">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {sc.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">มือถือ</p>
                      <p className="font-medium text-foreground">{repair.brand} {repair.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">วันนัด</p>
                      <p className="font-medium text-foreground">{repair.bookingDate} {repair.bookingTime} น.</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">อาการเสีย</p>
                      <p className="font-medium text-foreground">{repair.issue}</p>
                    </div>
                  </div>

                  {repair.technicianNote && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">หมายเหตุจากช่าง</p>
                      <p className="text-sm text-blue-800">{repair.technicianNote}</p>
                    </div>
                  )}

                  {repair.estimatedCost && (
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <p className="text-xs text-muted-foreground">ราคาประเมิน</p>
                      <p className="font-bold text-primary">฿{parseFloat(repair.estimatedCost).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
