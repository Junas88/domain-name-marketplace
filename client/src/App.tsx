import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ScrollManager } from "@/components/ScrollManager";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Guide from "@/pages/Guide";
import FAQs from "@/pages/FAQs";
import HowItWorks from "@/pages/HowItWorks";
import DomainValuation from "@/pages/DomainValuation";
import SellingStrategy from "@/pages/SellingStrategy";
import BuyerProtection from "@/pages/BuyerProtection";
import EbookPage from "@/pages/EbookPage";
import AdminDashboard from "@/pages/admin/Dashboard";
import LoginPage from "@/pages/auth/LoginPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/guide" component={Guide} />
      <Route path="/contact" component={Contact} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/domain-valuation" component={DomainValuation} />
      <Route path="/selling-strategy" component={SellingStrategy} />
      <Route path="/buyer-protection" component={BuyerProtection} />
      <Route path="/ebook" component={EbookPage} />
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollManager />
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
