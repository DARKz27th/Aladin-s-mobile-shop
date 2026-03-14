import { useState } from "react";
import { CheckCircle2, Wrench, Phone, Calendar, Clock, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";

const BRANDS = ["Apple", "Samsung", "OPPO", "Vivo", "Xiaomi", "Huawei", "อื่นๆ"];
const TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const COMMON_ISSUES = [
  "หน้าจอแตก / ไม่ติด",
  "แบตเตอรี่เสื่อม / ชาร์จไม่เข้า",
  "กล้องไม่ชัด / ไม่ทำงาน",
  "ลำโพงไม่มีเสียง",
  "แพชาร์จเสีย",
  "เครื่องเปิดไม่ติด",
  "ซอฟต์แวร์มีปัญหา",
  "อื่นๆ",
];

export default function RepairBooking() {
  const { user } = useAuth();
  const [repairCode, setRepairCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    phone: "",
    brand: "",
    model: "",
    issue: "",
    bookingDate: "",
    bookingTime: "",
  });

  const bookMutation = trpc.repairs.book.useMutation({
    onSuccess: (data) => {
      setRepairCode(data.repairCode);
      toast.success("จองคิวซ่อมสำเร็จ!");
    },
    onError: (err) => toast.error(`เกิดข้อผิดพลาด: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.brand || !form.model || !form.issue || !form.bookingDate || !form.bookingTime) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    bookMutation.mutate(form);
  };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  if (repairCode) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-border/60 p-10 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">จองคิวสำเร็จ!</h2>
          <p className="text-muted-foreground mb-4">รหัสซ่อมของคุณคือ</p>
          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-2xl font-bold text-primary tracking-widest">{repairCode}</p>
            <p className="text-xs text-muted-foreground mt-1">เก็บรหัสนี้ไว้เพื่อติดตามสถานะการซ่อม</p>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            เราจะติดต่อกลับเพื่อยืนยันการนัดหมาย กรุณานำมือถือมาที่ร้านตามวันและเวลาที่จอง
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/track">ติดตามสถานะการซ่อม</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">กลับหน้าแรก</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">จองคิวซ่อมมือถือ</h1>
          </div>
          <p className="text-muted-foreground">กรอกข้อมูลเพื่อจองคิวซ่อม เราจะติดต่อกลับเพื่อยืนยัน</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  ข้อมูลลูกค้า
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                    <Input
                      id="name"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0XX-XXX-XXXX"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  ข้อมูลมือถือ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>ยี่ห้อมือถือ *</Label>
                    <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกยี่ห้อ" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model">รุ่นมือถือ *</Label>
                    <Input
                      id="model"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="เช่น iPhone 15 Pro, Galaxy S24"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Issue */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  อาการเสีย
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_ISSUES.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setForm({ ...form, issue })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.issue === issue
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={form.issue}
                  onChange={(e) => setForm({ ...form, issue: e.target.value })}
                  placeholder="อธิบายอาการเสียโดยละเอียด..."
                  rows={3}
                  required
                />
              </div>

              {/* Booking Date & Time */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  วันและเวลาที่ต้องการ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">วันที่ *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.bookingDate}
                      onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
                      min={today}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>เวลา *</Label>
                    <Select value={form.bookingTime} onValueChange={(v) => setForm({ ...form, bookingTime: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกเวลา" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map((t) => (
                          <SelectItem key={t} value={t}>{t} น.</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? "กำลังจอง..." : "ยืนยันการจองคิว"}
              </Button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/60 p-5">
              <h3 className="font-semibold text-foreground mb-3">ขั้นตอนการซ่อม</h3>
              <ol className="space-y-3">
                {[
                  "จองคิวออนไลน์",
                  "นำมือถือมาที่ร้าน",
                  "ช่างตรวจสอบและแจ้งราคา",
                  "ยืนยันและดำเนินการซ่อม",
                  "รับมือถือคืนพร้อมรับประกัน",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-2xl border border-border/60 p-5">
              <h3 className="font-semibold text-foreground mb-3">เวลาทำการ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">จันทร์ – เสาร์</span>
                  <span className="font-medium">09:00 – 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">อาทิตย์</span>
                  <span className="font-medium">10:00 – 17:00</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="text-sm font-medium text-primary mb-1">ติดต่อด่วน</p>
              <a href="tel:0812345678" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                081-234-5678
              </a>
              <p className="text-xs text-muted-foreground mt-1">โทรได้เลยหากต้องการด่วน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
