import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ShoppingCart, MessageCircle, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";

const BRANDS = ["Apple", "Samsung", "Oppo", "Vivo", "Xiaomi", "Huawei"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    search: search || undefined,
    brand: selectedBrand || undefined,
    categoryId: selectedCategory,
    limit: LIMIT,
    offset: page * LIMIT,
  });

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

  const handleLineChat = (product: any) => {
    window.open(`https://line.me/ti/p/~aladinmobile?text=สอบถามสินค้า: ${encodeURIComponent(product.name)}`, "_blank");
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory(undefined);
    setPage(0);
  };

  const hasFilters = search || selectedBrand || selectedCategory;
  const totalPages = Math.ceil((productsData?.total ?? 0) / LIMIT);

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">ยี่ห้อมือถือ</h4>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => { setSelectedBrand(selectedBrand === brand ? "" : brand); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                selectedBrand === brand
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">ประเภทอะไหล่</h4>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setSelectedCategory(undefined); setPage(0); }}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
              !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            ทั้งหมด
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground">
          <X className="w-4 h-4 mr-1" /> ล้างตัวกรอง
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">อะไหล่มือถือ</h1>
          <p className="text-muted-foreground">อะไหล่แท้คุณภาพสูงทุกยี่ห้อ ราคาโรงงาน</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-border/60 p-5 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">ตัวกรอง</h3>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Filter Bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาอะไหล่ ยี่ห้อ รุ่น..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="pl-9 bg-white"
                />
              </div>

              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden bg-white">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle>ตัวกรอง</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBrand && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand("")} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {categories?.find((c) => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(undefined)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    ค้นหา: {search}
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-5">
              {isLoading ? "กำลังโหลด..." : `พบ ${productsData?.total ?? 0} รายการ`}
            </p>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border/60">
                    <Skeleton className="aspect-square" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsData?.items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">ไม่พบสินค้า</h3>
                <p className="text-muted-foreground text-sm mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                <Button variant="outline" onClick={clearFilters}>ล้างตัวกรองทั้งหมด</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {productsData?.items.map((product) => (
                    <div key={product.id} className="card-premium overflow-hidden group bg-white">
                      <Link href={`/products/${product.id}`}>
                        <div className="aspect-square bg-secondary/30 overflow-hidden">
                          <img
                            src={product.imageUrl ?? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          {product.brand && (
                            <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
                          )}
                          {product.stock <= 3 && product.stock > 0 && (
                            <Badge variant="destructive" className="text-xs">เหลือน้อย</Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">หมด</Badge>
                          )}
                        </div>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {product.model && (
                          <p className="text-xs text-muted-foreground mb-3">รุ่น: {product.model}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-primary text-lg">
                            {formatPrice(parseFloat(product.price))}
                          </span>
                          <span className="text-xs text-muted-foreground">คงเหลือ: {product.stock}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            {product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2.5"
                            onClick={() => handleLineChat(product)}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      ก่อนหน้า
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      หน้า {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      ถัดไป
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
