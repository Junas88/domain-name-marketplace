import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ScrollManager } from "@/components/ScrollManager";
import SeoPageWrapper from "@/components/SeoPageWrapper";
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
import EbookSuccess from "@/pages/EbookSuccess";
import DomainFinderPage from "@/pages/DomainFinderPage";
import SimpleAdminPage from "@/pages/SimpleAdminPage";
import SimpleLoginPage from "@/pages/SimpleLoginPage";
import DataSyncBackupPage from "@/components/admin/DataSyncBackupPage";

// Enhanced components with SEO metadata
const HomePage = () => <SeoPageWrapper pageKey="home"><Home /></SeoPageWrapper>;
const GuidePage = () => <SeoPageWrapper pageKey="guide"><Guide /></SeoPageWrapper>;
const ContactPage = () => <SeoPageWrapper pageKey="contact"><Contact /></SeoPageWrapper>;
const FAQsPage = () => <SeoPageWrapper pageKey="faqs"><FAQs /></SeoPageWrapper>;
const HowItWorksPage = () => <SeoPageWrapper pageKey="how-it-works"><HowItWorks /></SeoPageWrapper>;
const DomainValuationPage = () => <SeoPageWrapper pageKey="domain-valuation"><DomainValuation /></SeoPageWrapper>;
const SellingStrategyPage = () => <SeoPageWrapper pageKey="selling-strategy"><SellingStrategy /></SeoPageWrapper>;
const BuyerProtectionPage = () => <SeoPageWrapper pageKey="buyer-protection"><BuyerProtection /></SeoPageWrapper>;
const DomainFinderWrapper = () => <SeoPageWrapper pageKey="domain-finder"><DomainFinderPage /></SeoPageWrapper>;
const EbookWrapper = () => <SeoPageWrapper pageKey="ebook"><EbookPage /></SeoPageWrapper>;
const EbookSuccessWrapper = () => <SeoPageWrapper pageKey="ebook-success"><EbookSuccess /></SeoPageWrapper>;
const NotFoundWrapper = () => <SeoPageWrapper pageKey="not-found"><NotFound /></SeoPageWrapper>;

// Auth checking for admin dashboard is handled by the dashboard component itself

// Normal router for all pages
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/guide" component={GuidePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faqs" component={FAQsPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/domain-valuation" component={DomainValuationPage} />
      <Route path="/selling-strategy" component={SellingStrategyPage} />
      <Route path="/buyer-protection" component={BuyerProtectionPage} />
      <Route path="/domain-finder" component={DomainFinderWrapper} />
      <Route path="/ebook" component={EbookWrapper} />
      <Route path="/ebook-success" component={EbookSuccessWrapper} />
      <Route path="/login" component={SimpleLoginPage} />
      
      {/* Use direct, simple admin component for all admin paths */}
      <Route path="/admin" component={SimpleAdminPage} />
      <Route path="/admin/dashboard" component={SimpleAdminPage} />
      <Route path="/dashboard" component={SimpleAdminPage} />
      <Route path="/admin/index.html" component={SimpleAdminPage} />
      <Route path="/dashboard/index.html" component={SimpleAdminPage} />
      <Route path="/admin/sync" component={DataSyncBackupPage} />
      <Route path="/admin/backup" component={DataSyncBackupPage} />
      <Route component={NotFoundWrapper} />
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
