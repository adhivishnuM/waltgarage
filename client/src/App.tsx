import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

// Pages
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import BookService from "@/pages/book-service";
import TrackService from "@/pages/track-service";
import Vehicles from "@/pages/vehicles";
import Profile from "@/pages/profile";
import PartnerPortal from "@/pages/partner-portal";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      
      <Route path="/home">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      
      <Route path="/book">
        <ProtectedRoute>
          <BookService />
        </ProtectedRoute>
      </Route>
      
      <Route path="/track">
        <ProtectedRoute>
          <TrackService />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vehicles">
        <ProtectedRoute>
          <Vehicles />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/partner">
        <ProtectedRoute>
          <PartnerPortal />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
