import { useParams, Link } from "wouter";
import { ShoppingCart, MessageCircle, ArrowLeft, Shield, Truck, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const { data: product, isLoading } = trpc.products.get.useQuery({ id: productId });
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">ไม่พบสินค้า</h2>
          <Button asChild variant="outline">
            <Link href="/products">กลับไปหน้าสินค้า</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">อะไหล่มือถือ</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-border/60 overflow-hidden aspect-square">
            <img
              src={product.imageUrl ?? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
              {product.model && <Badge variant="outline">{product.model}</Badge>}
              {product.stock === 0 ? (
                <Badge variant="destructive">สินค้าหมด</Badge>
              ) : product.stock <= 3 ? (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">เหลือน้อย</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-green-200">มีสินค้า</Badge>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{product.name}</h1>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
            )}

            <div className="text-4xl font-bold text-primary mb-6">
              {formatPrice(parseFloat(product.price))}
            </div>

            <div className="text-sm text-muted-foreground mb-6">
              คงเหลือในสต็อก: <span className="font-medium text-foreground">{product.stock} ชิ้น</span>
            </div>

            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  window.open(
                    `https://line.me/ti/p/~aladinmobile?text=สอบถามสินค้า: ${encodeURIComponent(product.name)}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                สอบถาม LINE
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: "รับประกัน 6 เดือน" },
                { icon: CheckCircle, label: "อะไหล่แท้ 100%" },
                { icon: Truck, label: "ส่งทั่วประเทศ" },
                { icon: RotateCcw, label: "คืนสินค้าได้ใน 7 วัน" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
