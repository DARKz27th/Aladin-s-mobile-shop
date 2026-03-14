import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
          <p className="text-muted-foreground mb-6">เพิ่มสินค้าลงตะกร้าเพื่อเริ่มต้นการสั่งซื้อ</p>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              ดูสินค้าทั้งหมด
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          ตะกร้าสินค้า ({itemCount} รายการ)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-border/60 p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden shrink-0">
                  <img
                    src={item.imageUrl ?? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{item.name}</h3>
                  {item.brand && (
                    <p className="text-xs text-muted-foreground mb-2">{item.brand} {item.model}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-foreground mt-1">
                    รวม: {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/60 p-6 sticky top-24">
              <h2 className="font-semibold text-foreground mb-4">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  ดำเนินการชำระเงิน <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" asChild>
                <Link href="/products">ซื้อสินค้าเพิ่มเติม</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
