import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, Wrench, Phone, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "อะไหล์มือถือ" },
  { href: "/repair-booking", label: "จองซ่อม" },
  { href: "/repair-status", label: "ติดตามงานซ่อม" },
  { href: "/service-center", label: "ศูนย์บริการ" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => toast.error("ออกจากระบบไม่สำเร็จ"),
  });

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground leading-none">Aladin</span>
              <span className="font-bold text-lg text-primary leading-none">Mobile</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                    {itemCount > 9 ? "9+" : itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{user?.name ?? "บัญชี"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> โปรไฟล์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> ประวัติคำสั่งซื้อ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/repair-history" className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" /> ประวัติการซ่อม
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 text-primary font-medium">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-destructive focus:text-destructive gap-2"
                  >
                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="hidden sm:flex gap-1.5"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                <User className="w-4 h-4" />
                เข้าสู่ระบบ
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4" /> โปรไฟล์
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive w-full"
                  >
                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                  </button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => { window.location.href = getLoginUrl(); setMobileOpen(false); }}
                >
                  เข้าสู่ระบบ
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
