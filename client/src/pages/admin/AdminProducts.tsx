import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand: string;
  model: string;
  imageUrl: string;
  categoryId: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  brand: "",
  model: "",
  imageUrl: "",
  categoryId: "",
};

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    search: search || undefined,
    limit: 50,
    offset: 0,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      toast.success("เพิ่มสินค้าสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      toast.success("แก้ไขสินค้าสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setDeleteId(null);
      toast.success("ลบสินค้าสำเร็จ");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: String(product.stock),
      brand: product.brand ?? "",
      model: product.model ?? "",
      imageUrl: product.imageUrl ?? "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("กรุณากรอกชื่อ ราคา และจำนวนสต็อก");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: form.price,
      stock: parseInt(form.stock),
      brand: form.brand || undefined,
      model: form.model || undefined,
      imageUrl: form.imageUrl || undefined,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = productsData?.items ?? [];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการสินค้า</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {productsData?.total ?? 0} รายการ
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> เพิ่มสินค้า
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">สินค้า</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ยี่ห้อ/รุ่น</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ราคา</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">สต็อก</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-4 py-3" colSpan={5}>
                          <Skeleton className="h-10 w-full" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((product) => (
                      <tr key={product.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                              <img
                                src={product.imageUrl ?? "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=80"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">#{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">{product.brand ?? "–"}</p>
                          <p className="text-xs text-muted-foreground">{product.model ?? "–"}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-primary">{formatPrice(parseFloat(product.price))}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {product.stock <= 3 && product.stock > 0 && (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            <span className={`text-sm font-medium ${product.stock === 0 ? "text-destructive" : product.stock <= 3 ? "text-orange-600" : "text-foreground"}`}>
                              {product.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(product)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>ชื่อสินค้า *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ราคา (บาท) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>จำนวนสต็อก *</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ยี่ห้อ</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>รุ่น</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>URL รูปภาพ</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              ลบสินค้า
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
