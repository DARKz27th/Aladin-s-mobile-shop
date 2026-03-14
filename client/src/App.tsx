import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import RepairBooking from "./pages/RepairBooking";
import RepairStatus from "./pages/RepairStatus";
import ServiceCenter from "./pages/ServiceCenter";
import OrderHistory from "./pages/OrderHistory";
import RepairHistory from "./pages/RepairHistory";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRepairs from "./pages/admin/AdminRepairs";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/repair-booking" component={RepairBooking} />
        <Route path="/repair-status" component={RepairStatus} />
        <Route path="/service-center" component={ServiceCenter} />
        <Route path="/orders" component={OrderHistory} />
        <Route path="/repair-history" component={RepairHistory} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/repairs" component={AdminRepairs} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
