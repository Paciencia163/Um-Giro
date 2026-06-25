import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import Itineraries from "./pages/Itineraries";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import VirtualTourism from "./pages/VirtualTourism";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import DetailPage from "./pages/DetailPage";
import Messages from "./pages/Messages";
import Loyalty from "./pages/Loyalty";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/admin/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRewards from "./pages/admin/AdminRewards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/roteiros" element={<Itineraries />} />
          <Route path="/reservar" element={<BookingForm />} />
          <Route path="/minhas-reservas" element={<MyBookings />} />
          <Route path="/turismo-virtual" element={<VirtualTourism />} />
          <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
          <Route path="/pagamento-cancelado" element={<PaymentCanceled />} />
          <Route path="/detalhe/:type/:id" element={<DetailPage />} />
          <Route path="/mensagens" element={<Messages />} />
          <Route path="/fidelidade" element={<Loyalty />} />
          <Route path="/pagamentos" element={<PaymentHistory />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/categorias" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/locais" element={<AdminRoute><AdminLocations /></AdminRoute>} />
          <Route path="/admin/servicos" element={<AdminRoute><AdminServices /></AdminRoute>} />
          <Route path="/admin/reservas" element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="/admin/utilizadores" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/recompensas" element={<AdminRoute><AdminRewards /></AdminRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
