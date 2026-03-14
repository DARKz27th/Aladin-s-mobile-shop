import { useState } from "react";
import { Search, Wrench, CheckCircle2, Clock, Package, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDate, formatDateTime } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; step: number }> = {
  received: { label: "รับเครื่องแล้ว", color: "status-received", icon: Package, step: 1 },
  diagnosing: { label: "กำลังตรวจสอบ", color: "status-diagnosing", icon: Search, step: 2 },
  repairing: { label: "กำลังซ่อม", color: "status-repairing", icon: Wrench, step: 3 },
  waiting_parts: { label: "รออะไหล่", color: "status-waiting_parts", icon: Clock, step: 3 },
  completed: { label: "ซ่อมเสร็จแล้ว", color: "status-completed", icon: CheckCircle2, step: 4 },
  ready_pickup: { label: "รอรับเครื่อง", color: "status-ready_pickup", icon: CheckCircle2, step: 5 },
  cancelled: { label: "ยกเลิก", color: "status-cancelled", icon: XCircle, step: 0 },
};

const STEPS = [
  { label: "รับเครื่อง", step: 1 },
  { label: "ตรวจสอบ", step: 2 },
  { label: "ซ่อม", step: 3 },
  { label: "เสร็จสิ้น", step: 4 },
  { label: "รับเครื่อง", step: 5 },
];

function RepairCard({ repair }: { repair: any }) {
  const status = STATUS_CONFIG[repair.status] ?? STATUS_CONFIG.received;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">รหัสซ่อม</p>
            <p className="text-xl font-bold text-foreground tracking-wider">{repair.repairCode}</p>
          </div>
          <Badge className={`${status.color} text-xs px-3 py-1`}>
            <StatusIcon className="w-3.5 h-3.5 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      {repair.status !== "cancelled" && (
        <div className="px-5 py-4 bg-secondary/30">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  status.step >= s.step
                    ? "bg-primary text-white"
                    : "bg-border text-muted-foreground"
                }`}>
                  {status.step > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                    status.step > s.step ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 text-center">
                <p className={`text-xs ${status.step >= s.step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">ชื่อลูกค้า</p>
          <p className="font-medium text-sm text-foreground">{repair.customerName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">เบอร์โทร</p>
          <p className="font-medium text-sm text-foreground">{repair.phone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">มือถือ</p>
          <p className="font-medium text-sm text-foreground">{repair.brand} {repair.model}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">วันที่จอง</p>
          <p className="font-medium text-sm text-foreground">{repair.bookingDate} {repair.bookingTime} น.</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">อาการเสีย</p>
          <p className="font-medium text-sm text-foreground">{repair.issue}</p>
        </div>
        {repair.technicianNote && (
          <div className="col-span-2 bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">หมายเหตุจากช่าง</p>
            <p className="text-sm text-blue-800">{repair.technicianNote}</p>
          </div>
        )}
        {repair.estimatedCost && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">ราคาประเมิน</p>
            <p className="font-bold text-primary text-lg">฿{parseFloat(repair.estimatedCost).toLocaleString()}</p>
          </div>
        )}
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">วันที่จอง</p>
          <p className="text-sm text-foreground">{formatDateTime(repair.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function RepairStatus() {
  const [searchType, setSearchType] = useState<"code" | "phone">("code");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const codeQuery = trpc.repairs.trackByCode.useQuery(
    { repairCode: submitted },
    { enabled: searchType === "code" && !!submitted }
  );

  const phoneQuery = trpc.repairs.trackByPhone.useQuery(
    { phone: submitted },
    { enabled: searchType === "phone" && !!submitted }
  );

  const isLoading = codeQuery.isLoading || phoneQuery.isLoading;
  const error = codeQuery.error || phoneQuery.error;

  const repairs = searchType === "code"
    ? (codeQuery.data ? [codeQuery.data] : [])
    : (phoneQuery.data ?? []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(query.trim());
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">ติดตามสถานะการซ่อม</h1>
          </div>
          <p className="text-muted-foreground">กรอกรหัสซ่อมหรือเบอร์โทรเพื่อตรวจสอบสถานะ</p>
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-border/60 p-6 mb-6">
          {/* Toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-secondary rounded-xl">
            <button
              onClick={() => { setSearchType("code"); setSubmitted(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === "code" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              รหัสซ่อม
            </button>
            <button
              onClick={() => { setSearchType("phone"); setSubmitted(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === "phone" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              เบอร์โทรศัพท์
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === "code" ? "กรอกรหัสซ่อม เช่น REP-ABC123-XYZ" : "กรอกเบอร์โทรศัพท์"}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        {/* Results */}
        {submitted && (
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">กำลังค้นหา...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">ไม่พบข้อมูล</h3>
                <p className="text-sm text-muted-foreground">
                  {searchType === "code"
                    ? "ไม่พบรหัสซ่อมนี้ กรุณาตรวจสอบอีกครั้ง"
                    : "ไม่พบประวัติการซ่อมสำหรับเบอร์นี้"}
                </p>
              </div>
            )}

            {!isLoading && !error && repairs.length === 0 && (
              <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">ไม่พบข้อมูล</h3>
                <p className="text-sm text-muted-foreground">ไม่พบประวัติการซ่อมสำหรับข้อมูลนี้</p>
              </div>
            )}

            {!isLoading && repairs.map((repair: any) => (
              <RepairCard key={repair.id} repair={repair} />
            ))}
          </div>
        )}

        {!submitted && (
          <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">ติดตามงานซ่อมของคุณ</h3>
            <p className="text-sm text-muted-foreground">
              กรอกรหัสซ่อมที่ได้รับหลังจากจองคิว หรือเบอร์โทรที่ใช้จอง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
