import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BranchProvider } from "./contexts/BranchContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import VideoQuality from "./pages/VideoQuality";
import DeletedVideos from "./pages/DeletedVideos";
import History from "./pages/History";
import DeletedDescriptions from "./pages/DeletedDescriptions";
import Auth from "./pages/Auth";
import Receipts from "./pages/Receipts";
import DeletedReceipts from "./pages/receipts/DeletedReceipts";
import ReceiptAnalysis from "./pages/receipts/ReceiptAnalysis";
import ITSupport from "./pages/ITSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper for branch-based pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const selectedBranch = localStorage.getItem('selectedBranch');
  
  if (!selectedBranch) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Auth-protected route wrapper
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Admin-protected route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/receipts" replace />;
  }
  
  return <>{children}</>;
};

// IT Support route wrapper
const ITSupportRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isITSupport } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isITSupport) {
    return <Navigate to="/receipts" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BranchProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/branch-selection" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/deleted-descriptions" element={<ProtectedRoute><DeletedDescriptions /></ProtectedRoute>} />
              <Route path="/video-quality" element={<ProtectedRoute><VideoQuality /></ProtectedRoute>} />
              <Route path="/deleted-videos" element={<ProtectedRoute><DeletedVideos /></ProtectedRoute>} />
              <Route path="/receipts" element={<AuthRoute><Receipts /></AuthRoute>} />
              <Route path="/receipt-analysis" element={<AdminRoute><ReceiptAnalysis /></AdminRoute>} />
              <Route path="/deleted-receipts" element={<AdminRoute><DeletedReceipts /></AdminRoute>} />
              <Route path="/it-support" element={<ITSupportRoute><ITSupport /></ITSupportRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BranchProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
