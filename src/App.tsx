import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BranchProvider } from "./contexts/BranchContext";
import Index from "./pages/Index";
import VideoQuality from "./pages/VideoQuality";
import DeletedVideos from "./pages/DeletedVideos";
import History from "./pages/History";
import DeletedDescriptions from "./pages/DeletedDescriptions";
import BranchSelection from "./pages/BranchSelection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const selectedBranch = localStorage.getItem('selectedBranch');
  
  if (!selectedBranch) {
    return <Navigate to="/branch-selection" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BranchProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/branch-selection" element={<BranchSelection />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/deleted-descriptions" element={<ProtectedRoute><DeletedDescriptions /></ProtectedRoute>} />
            <Route path="/video-quality" element={<ProtectedRoute><VideoQuality /></ProtectedRoute>} />
            <Route path="/deleted-videos" element={<ProtectedRoute><DeletedVideos /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BranchProvider>
  </QueryClientProvider>
);

export default App;
