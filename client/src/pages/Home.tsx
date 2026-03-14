import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Smartphone,
  Battery,
  Wrench,
  ShoppingBag,
  Star,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Phone,
  CheckCircle2,
  ArrowRight,
  Zap,
  Camera,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const services = [
  {
    icon: Smartphone,
    title: "ซ่อมหน้าจอแตก",
    desc: "เปลี่ยนหน้าจอทุกรุ่น ของแท้ รับประกัน 6 เดือน",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Battery,
    title: "เปลี่ยนแบตเตอรี่",
    desc: "แบตเตอรี่คุณภาพสูง ความจุเต็ม ไม่บวม",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Wrench,
    title: "ซ่อมเมนบอร์ด",
    desc: "ช่างผู้เชี่ยวชาญ แก้ปัญหาลึกถึงระดับชิป",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: ShoppingBag,
    title: "ขายอะไหล่มือถือ",
    desc: "อะไหล่แท้ทุกยี่ห้อ ราคาโรงงาน ส่งทั่วประเทศ",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Camera,
    title: "ซ่อมกล้อง",
    desc: "กล้องหน้า กล้องหลัง ชัดคมเหมือนใหม่",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    icon: Volume2,
    title: "ซ่อมลำโพง / ไมค์",
    desc: "เสียงใสชัด ไม่แตก ไม่เบา",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

const features = [
  { icon: Shield, title: "รับประกันงานซ่อม", desc: "รับประกันทุกงานซ่อม 3–6 เดือน" },
  { icon: Award, title: "ช่างมืออาชีพ", desc: "ช่างผ่านการอบรมมาตรฐาน มีประสบการณ์กว่า 10 ปี" },
  { icon: Clock, title: "บริการรวดเร็ว", desc: "ซ่อมเสร็จภายใน 1–2 ชั่วโมง สำหรับงานทั่วไป" },
  { icon: Zap, title: "อะไหล่แท้ 100%", desc: "ใช้อะไหล่คุณภาพสูง ตรงรุ่น ตรงสเปก" },
];

const reviews = [
  {
    name: "คุณสมชาย ใจดี",
    rating: 5,
    text: "ซ่อมหน้าจอ iPhone 14 Pro ได้เร็วมาก ภายใน 1 ชั่วโมง หน้าจอสวยเหมือนใหม่เลย ราคาก็สมเหตุสมผล",
    service: "ซ่อมหน้าจอ",
  },
  {
    name: "คุณนภา รักดี",
    rating: 5,
    text: "เปลี่ยนแบตเตอรี่ Samsung ใช้งานได้ดีมาก แบตทนขึ้นเยอะ ช่างพูดจาดี อธิบายละเอียด",
    service: "เปลี่ยนแบตเตอรี่",
  },
  {
    name: "คุณวิชัย สุขใจ",
    rating: 5,
    text: "สั่งอะไหล่ออนไลน์ได้ของรวดเร็ว อะไหล่แท้ ราคาดีกว่าที่อื่นมาก จะกลับมาอีกแน่นอน",
    service: "สั่งอะไหล่",
  },
];

const brands = ["Apple", "Samsung", "OPPO", "Vivo", "Xiaomi", "Huawei"];

export default function Home() {
  const { data: productsData } = trpc.products.list.useQuery({ limit: 4, offset: 0 });
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
      brand: product.brand,
      model: product.model,
    });
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="gradient-hero text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
        </div>

        <div className="container relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/20 text-sm px-4 py-1.5">
              ✦ ร้านอะไหล่และซ่อมมือถือครบวงจร
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">AladinMobile</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-white/80 mt-2">
                ร้านขายอะไหล่มือถือ
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-white/80">
                และรับซ่อมมือถือครบวงจร
              </span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
              บริการซ่อมมือถือทุกอาการ ขายอะไหล่แท้ทุกยี่ห้อ ช่างมืออาชีพ รับประกันงานซ่อม
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 shadow-lg"
                asChild
              >
                <Link href="/repair-booking">
                  <Wrench className="w-5 h-5 mr-2" />
                  จองคิวซ่อม
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  ดูอะไหล่
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-10 border-t border-white/20">
              {[
                { value: "10,000+", label: "ลูกค้าที่ไว้วางใจ" },
                { value: "5,000+", label: "งานซ่อมสำเร็จ" },
                { value: "10 ปี", label: "ประสบการณ์" },
                { value: "100%", label: "อะไหล่แท้" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-primary bg-primary/10 border-primary/20">
              บริการของเรา
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              บริการซ่อมมือถือครบวงจร
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              เราให้บริการซ่อมมือถือทุกอาการ ด้วยช่างผู้เชี่ยวชาญและอะไหล่คุณภาพสูง
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="card-premium p-6 group">
                <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-4`}>
                  <service.icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/repair-booking" className="gap-2">
                จองคิวซ่อมเลย <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/40">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3 text-primary bg-primary/10 border-primary/20">
                อะไหล่แนะนำ
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                อะไหล่มือถือยอดนิยม
              </h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex gap-1">
              <Link href="/products">
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productsData?.items.map((product) => (
              <div key={product.id} className="card-premium overflow-hidden group">
                <div className="aspect-square bg-secondary/50 overflow-hidden">
                  <img
                    src={product.imageUrl ?? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {product.brand && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {product.brand}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(parseFloat(product.price))}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="text-xs h-8 px-3"
                    >
                      เพิ่มลงตะกร้า
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/products">ดูอะไหล่ทั้งหมด</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Why Us ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-primary bg-primary/10 border-primary/20">
              ทำไมต้องเลือกเรา
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              มาตรฐานระดับมืออาชีพ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brands ────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-secondary/30 border-y border-border">
        <div className="container">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
            ยี่ห้อที่เรารองรับ
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-12">
            {brands.map((brand) => (
              <div key={brand} className="text-xl font-bold text-muted-foreground/50 hover:text-primary transition-colors cursor-default">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-primary bg-primary/10 border-primary/20">
              รีวิวจากลูกค้า
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              ลูกค้าพูดถึงเรา
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.service}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 gradient-hero text-white">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            พร้อมให้บริการคุณแล้ว
          </h2>
          <p className="text-white/70 mb-8 text-lg max-w-xl mx-auto">
            จองคิวซ่อมออนไลน์ได้ทันที หรือติดต่อเราผ่านช่องทางที่สะดวก
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8" asChild>
              <Link href="/repair-booking">
                <Wrench className="w-5 h-5 mr-2" />
                จองคิวซ่อมเลย
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
              asChild
            >
              <Link href="/service-center">
                <Phone className="w-5 h-5 mr-2" />
                ติดต่อเรา
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
