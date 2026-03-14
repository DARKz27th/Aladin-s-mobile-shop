import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { CreditCard, Banknote, Truck, Upload, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "wouter";

const PAYMENT_METHODS = [
  {
    id: "transfer" as const,
    label: "โอนเงิน / QR Code",
    desc: "โอนเงินผ่านธนาคารหรือ PromptPay",
    icon: Banknote,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "visa" as const,
    label: "บัตรเครดิต / Visa",
    desc: "ชำระด้วยบัตรเครดิตหรือเดบิต",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "messenger" as const,
    label: "ส่งแมส (เร่งด่วน)",
    desc: "สำหรับกรณีเร่งด่วน ส่งสินค้าทันที",
    icon: Truck,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "visa" | "messenger">("transfer");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    customerEmail: user?.email ?? "",
    customerPhone: "",
    address: "",
    note: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      if (paymentMethod === "transfer") {
        setStep("payment");
      } else {
        setStep("success");
        clearCart();
      }
    },
    onError: (err) => toast.error(`เกิดข้อผิดพลาด: ${err.message}`),
  });

  const uploadSlipMutation = trpc.orders.uploadSlip.useMutation({
    onSuccess: () => {
      setStep("success");
      clearCart();
      toast.success("อัปโหลดสลิปสำเร็จ");
    },
    onError: (err) => toast.error(`อัปโหลดสลิปไม่สำเร็จ: ${err.message}`),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ขนาดใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }
    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSlipPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = () => {
    if (!form.customerName || !form.customerPhone) {
      toast.error("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }
    if (items.length === 0) {
      toast.error("ไม่มีสินค้าในตะกร้า");
      return;
    }
    createOrderMutation.mutate({
      ...form,
      total: total.toFixed(2),
      paymentMethod,
      items: items.map((item) => ({
        productId: item.id,
        productName: item.name,
        price: item.price.toFixed(2),
        quantity: item.quantity,
      })),
    });
  };

  const handleUploadSlip = async () => {
    if (!slipFile || !orderId) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadSlipMutation.mutate({
        orderId,
        imageBase64: base64,
        mimeType: slipFile.type,
      });
    };
    reader.readAsDataURL(slipFile);
  };

  if (items.length === 0 && step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">ไม่มีสินค้าในตะกร้า</h2>
          <Button asChild><Link href="/products">ดูสินค้า</Link></Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-border/60 p-10 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">สั่งซื้อสำเร็จ!</h2>
          <p className="text-muted-foreground mb-2">
            หมายเลขคำสั่งซื้อ: <span className="font-semibold text-foreground">#{orderId}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            เราจะติดต่อกลับเพื่อยืนยันคำสั่งซื้อของคุณ
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild><Link href="/orders">ดูประวัติคำสั่งซื้อ</Link></Button>
            <Button variant="outline" asChild><Link href="/">กลับหน้าแรก</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container py-8 max-w-lg">
          <h1 className="text-2xl font-bold mb-6">อัปโหลดสลิปการโอนเงิน</h1>
          <div className="bg-white rounded-2xl border border-border/60 p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-blue-800 mb-1">ข้อมูลการโอนเงิน</p>
              <p className="text-sm text-blue-700">ธนาคารกสิกรไทย: 123-4-56789-0</p>
              <p className="text-sm text-blue-700">ชื่อบัญชี: ร้านอลาดินโมบาย</p>
              <p className="text-sm font-bold text-blue-800 mt-2">
                ยอดที่ต้องโอน: {formatPrice(total)}
              </p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors mb-4"
              onClick={() => fileRef.current?.click()}
            >
              {slipPreview ? (
                <img src={slipPreview} alt="slip" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดสลิป</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG สูงสุด 5MB</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("success")}
                className="flex-1"
              >
                ข้ามขั้นตอนนี้
              </Button>
              <Button
                className="flex-1"
                onClick={handleUploadSlip}
                disabled={!slipFile || uploadSlipMutation.isPending}
              >
                {uploadSlipMutation.isPending ? "กำลังอัปโหลด..." : "ยืนยันการชำระเงิน"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">ชำระเงิน</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-border/60 p-6">
              <h2 className="font-semibold text-foreground mb-4">ข้อมูลลูกค้า</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="name"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="กรอกชื่อ-นามสกุล"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phone"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="0XX-XXX-XXXX"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="example@email.com"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="note">หมายเหตุ</Label>
                  <Textarea
                    id="note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-border/60 p-6">
              <h2 className="font-semibold text-foreground mb-4">วิธีชำระเงิน</h2>
              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${method.bg} flex items-center justify-center shrink-0`}>
                      <method.icon className={`w-5 h-5 ${method.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-border/60 p-6 sticky top-24">
              <h2 className="font-semibold text-foreground mb-4">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>ยอดรวม</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmitOrder}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
