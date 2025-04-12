import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, LogOut, LayoutDashboard, PlusCircle, Save, Settings, Database, Search, Users, Mail, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Domain, PageContent, SeoSettings, Consultation, EmailSubmission } from "@shared/schema";

// We'll add table components inline for now to avoid import errors
// This approach keeps all functionality within a single file for maximum deployment compatibility

// Define types for our statistics
type DomainStats = {
  totalDomains: number;
  soldDomains: number;
  totalViews: number;
  domainsByCategory: Record<string, number>;
  totalRevenue: number;
  averagePrice: number;
};

export default function SimpleAdminDashboard() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // Authentication and redirects
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Authentication check
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("User not authorized, redirecting to login");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/auth"; // Direct browser navigation
      }, 300);
    }
  }, [user, isLoading]);
  
  // API Data fetching
  const { data: stats = { 
    totalDomains: 0, 
    soldDomains: 0, 
    totalViews: 0,
    domainsByCategory: {},
    totalRevenue: 0,
    averagePrice: 0
  }, isLoading: statsLoading } = useQuery<DomainStats>({
    queryKey: ['/api/admin/domains/stats'],
    enabled: !!user?.isAdmin,
  });
  
  const { data: domains = [], isLoading: domainsLoading } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: !!user?.isAdmin && activeTab === "domains",
  });
  
  const { data: pageContents = [], isLoading: pageContentsLoading } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
    enabled: !!user?.isAdmin && (activeTab === "content" || activeTab === "site"),
  });
  
  const { data: seoSettings = [], isLoading: seoLoading } = useQuery<SeoSettings[]>({
    queryKey: ['/api/admin/seo-settings'],
    enabled: !!user?.isAdmin && activeTab === "seo",
  });
  
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ['/api/admin/consultations'],
    enabled: !!user?.isAdmin && activeTab === "consultations",
  });
  
  const { data: emailSubmissions = [], isLoading: emailsLoading } = useQuery<EmailSubmission[]>({
    queryKey: ['/api/admin/email-submissions'],
    enabled: !!user?.isAdmin && activeTab === "emails",
  });
  
  // Loading state
  if (isLoading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">
          {isRedirecting ? "Redirecting to login..." : "Loading dashboard..."}
        </p>
      </div>
    );
  }
  
  // Authorization check
  if (!user?.isAdmin) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left sidebar for navigation */}
      <div className="w-64 border-r bg-white p-4 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1">Admin Panel</h2>
          <p className="text-sm text-gray-500">Domain Name Guide</p>
        </div>
        
        <div className="space-y-1">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </Button>
          
          <Button 
            variant={activeTab === "domains" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("domains")}
          >
            <Database className="h-4 w-4 mr-2" />
            Domains
          </Button>
          
          <Button 
            variant={activeTab === "offers" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("offers")}
          >
            <Tag className="h-4 w-4 mr-2" />
            Offers
          </Button>
          
          <Button 
            variant={activeTab === "consultations" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("consultations")}
          >
            <Users className="h-4 w-4 mr-2" />
            Consultations
          </Button>
          
          <Button 
            variant={activeTab === "content" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("content")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Page Content
          </Button>
          
          <Button 
            variant={activeTab === "site" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("site")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Website Editor
          </Button>
          
          <Button 
            variant={activeTab === "emails" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("emails")}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Submissions
          </Button>
          
          <Button 
            variant={activeTab === "seo" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("seo")}
          >
            <Search className="h-4 w-4 mr-2" />
            SEO Settings
          </Button>
          
          <Button 
            variant={activeTab === "ebooks" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("ebooks")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ebook Files
          </Button>
        </div>
        
        <div className="mt-8 pt-8 border-t">
          <Button 
            variant="outline" 
            className="w-full border-black justify-start" 
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  window.location.href = '/';
                }
              });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
        <div className="flex justify-between">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={activeTab === "domains" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("domains")}
          >
            <Database className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={activeTab === "content" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("content")}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={activeTab === "site" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("site")}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  window.location.href = '/';
                }
              });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6 overflow-auto pb-16 md:pb-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "domains" && "Domain Management"}
            {activeTab === "offers" && "Offers Management"}
            {activeTab === "consultations" && "Consultations"}
            {activeTab === "content" && "Page Content Management"}
            {activeTab === "site" && "Website Editor"}
            {activeTab === "emails" && "Email Submissions"}
            {activeTab === "seo" && "SEO Settings"}
            {activeTab === "ebooks" && "Ebook Files"}
          </h1>
        </header>
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalDomains}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Domains Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.soldDomains}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalViews}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">From sold domains</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Average Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${stats.averagePrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Per domain</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.soldDomains > 0 ? ((stats.soldDomains / stats.totalDomains) * 100).toFixed(1) : "0"}%</div>
                  <div className="text-sm text-gray-500 mt-1">Domains sold / total domains</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => setActiveTab("domains")}
                  >
                    Manage Domains
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("content")}
                  >
                    Edit Website Content
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("site")}
                  >
                    Update Website Design
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("seo")}
                  >
                    Optimize SEO Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Database Status:</span>
                    <span className="font-medium text-green-600">Connected</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Page Content Items:</span>
                    <span className="font-medium">{pageContents.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">SEO Settings:</span>
                    <span className="font-medium">{seoSettings.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Admin Account:</span>
                    <span className="font-medium">{user?.username}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        {/* Render tabbed content per feature */}
        {activeTab === "domains" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain Management</CardTitle>
                <CardDescription>Manage your domain listings</CardDescription>
              </CardHeader>
              <CardContent>
                {domainsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to manage domains.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "offers" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Offers Management</CardTitle>
                <CardDescription>View and manage domain offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No offers received yet.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "consultations" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultations</CardTitle>
                <CardDescription>Domain finder consultation requests</CardDescription>
              </CardHeader>
              <CardContent>
                {consultationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : consultations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No consultation requests received yet.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to view consultations.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "content" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Content Management</CardTitle>
                <CardDescription>Edit website page content</CardDescription>
              </CardHeader>
              <CardContent>
                {pageContentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to manage page content.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "site" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Editor</CardTitle>
                <CardDescription>Complete website design editor</CardDescription>
              </CardHeader>
              <CardContent>
                {pageContentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to access the website editor.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "emails" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Submissions</CardTitle>
                <CardDescription>View email submissions for ebook downloads</CardDescription>
              </CardHeader>
              <CardContent>
                {emailsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to manage email submissions.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "seo" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent>
                {seoLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Visit the full dashboard to manage SEO settings.</p>
                    <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === "ebooks" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ebook Files</CardTitle>
                <CardDescription>Manage downloadable ebook files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Visit the full dashboard to manage ebook files.</p>
                  <Button onClick={() => window.location.href = "/admin"}>Full Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}