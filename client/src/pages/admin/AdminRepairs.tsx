import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const REPAIR_STATUSES = [
  { value: "received", label: "รับเครื่องแล้ว", color: "bg-blue-100 text-blue-700" },
  { value: "diagnosing", label: "กำลังตรวจสอบ", color: "bg-yellow-100 text-yellow-700" },
  { value: "repairing", label: "กำลังซ่อม", color: "bg-orange-100 text-orange-700" },
  { value: "waiting_parts", label: "รออะไหล่", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "ซ่อมเสร็จแล้ว", color: "bg-green-100 text-green-700" },
  { value: "ready_pickup", label: "รอรับเครื่อง", color: "bg-teal-100 text-teal-700" },
  { value: "cancelled", label: "ยกเลิก", color: "bg-red-100 text-red-700" },
];

export default function AdminRepairs() {
  const [search, setSearch] = useState("");
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ status: "", technicianNote: "", estimatedCost: "" });

  const utils = trpc.useUtils();
  const { data: repairs, isLoading } = trpc.repairs.allRepairs.useQuery();

  const updateMutation = trpc.repairs.updateStatus.useMutation({
    onSuccess: () => {
      utils.repairs.allRepairs.invalidate();
      setSelectedRepair(null);
      toast.success("อัปเดตสถานะสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleOpenDetail = (repair: any) => {
    setSelectedRepair(repair);
    setUpdateForm({
      status: repair.status,
      technicianNote: repair.technicianNote ?? "",
      estimatedCost: repair.estimatedCost ?? "",
    });
  };

  const handleUpdate = () => {
    if (!selectedRepair) return;
    updateMutation.mutate({
      id: selectedRepair.id,
      status: updateForm.status,
      technicianNote: updateForm.technicianNote || undefined,
      estimatedCost: updateForm.estimatedCost || undefined,
    });
  };

  const filtered = (repairs ?? []).filter(
    (r: any) =>
      !search ||
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.repairCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search)
  );

  const getStatusConfig = (status: string) =>
    REPAIR_STATUSES.find((s) => s.value === status) ?? { label: status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการงานซ่อม</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} รายการ</p>
          </div>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาด้วยรหัสซ่อม ชื่อ หรือเบอร์โทร..."
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">รหัสซ่อม</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ลูกค้า</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">มือถือ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">วันนัด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">สถานะ</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-4 py-4" colSpan={6}>
                          <div className="h-6 bg-secondary rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((repair: any) => {
                      const sc = getStatusConfig(repair.status);
                      return (
                        <tr key={repair.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-medium text-foreground">{repair.repairCode}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{repair.customerName}</p>
                            <p className="text-xs text-muted-foreground">{repair.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-foreground">{repair.brand} {repair.model}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {repair.bookingDate} {repair.bookingTime} น.
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${sc.color}`} variant="secondary">
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDetail(repair)}
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

      {/* Detail/Update Dialog */}
      <Dialog open={!!selectedRepair} onOpenChange={() => setSelectedRepair(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>งานซ่อม: {selectedRepair?.repairCode}</DialogTitle>
          </DialogHeader>
          {selectedRepair && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm bg-secondary/30 rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground">ลูกค้า</p>
                  <p className="font-medium">{selectedRepair.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium">{selectedRepair.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">มือถือ</p>
                  <p className="font-medium">{selectedRepair.brand} {selectedRepair.model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">วันนัด</p>
                  <p className="font-medium">{selectedRepair.bookingDate} {selectedRepair.bookingTime} น.</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">อาการเสีย</p>
                  <p className="font-medium">{selectedRepair.issue}</p>
                </div>
              </div>

              <div>
                <Label>สถานะการซ่อม</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAIR_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ราคาประเมิน (บาท)</Label>
                <Input
                  type="number"
                  value={updateForm.estimatedCost}
                  onChange={(e) => setUpdateForm({ ...updateForm, estimatedCost: e.target.value })}
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>หมายเหตุจากช่าง</Label>
                <Textarea
                  value={updateForm.technicianNote}
                  onChange={(e) => setUpdateForm({ ...updateForm, technicianNote: e.target.value })}
                  className="mt-1"
                  rows={3}
                  placeholder="บันทึกข้อมูลการซ่อม..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRepair(null)}>ยกเลิก</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
