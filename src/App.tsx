import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExperimentProvider } from "@/contexts/ExperimentContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Experiment pages
import ConsentScreen from "./pages/experiment/ConsentScreen";
import SociodemographicScreen from "./pages/experiment/SociodemographicScreen";
import AUTScreen from "./pages/experiment/AUTScreen";
import FIQScreen from "./pages/experiment/FIQScreen";
import DilemmasScreen from "./pages/experiment/DilemmasScreen";
import ThankYouScreen from "./pages/experiment/ThankYouScreen";
import DeclinedScreen from "./pages/experiment/DeclinedScreen";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AUTManagement from "./pages/admin/AUTManagement";
import FIQManagement from "./pages/admin/FIQManagement";
import DilemmasManagement from "./pages/admin/DilemmasManagement";
import ExportData from "./pages/admin/ExportData";

const queryClient = new QueryClient();

// Simple auth guard for admin routes
function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ExperimentProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Experiment flow */}
            <Route path="/experimento/consentimento" element={<ConsentScreen />} />
            <Route path="/experimento/sociodemografico" element={<SociodemographicScreen />} />
            <Route path="/experimento/aut" element={<AUTScreen />} />
            <Route path="/experimento/fiq" element={<FIQScreen />} />
            <Route path="/experimento/dilemas" element={<DilemmasScreen />} />
            <Route path="/experimento/agradecimento" element={<ThankYouScreen />} />
            <Route path="/experimento/encerrado" element={<DeclinedScreen />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="aut" element={<AUTManagement />} />
              <Route path="fiq" element={<FIQManagement />} />
              <Route path="dilemas" element={<DilemmasManagement />} />
              <Route path="exportar" element={<ExportData />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ExperimentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
