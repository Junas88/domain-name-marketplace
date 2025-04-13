import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, Loader2, Plus, Pencil, Trash, Check, Tag, 
  CirclePlus, CircleCheck, Upload, Search
} from "lucide-react";
import { Domain, PageContent, SeoSettings, Consultation, EmailSubmission, Offer } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function SimpleAdminPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("domains");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Simple admin check with redirect
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }
  }, [user, isLoading]);

  // Check if user is admin
  const isAdmin = !!user?.isAdmin;
  
  // Domain data query
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: isAdmin,
  });
  
  // Page content query
  const { data: pageContents = [] } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
    enabled: isAdmin,
  });
  
  // SEO settings query
  const { data: seoSettings = [] } = useQuery<SeoSettings[]>({
    queryKey: ['/api/admin/seo-settings'],
    enabled: isAdmin,
  });
  
  // Consultations query
  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ['/api/admin/consultations'],
    enabled: isAdmin,
  });
  
  // Email submissions query
  const { data: emailSubmissions = [] } = useQuery<EmailSubmission[]>({
    queryKey: ['/api/admin/email-submissions'],
    enabled: isAdmin,
  });
  
  // Offers query (currently empty but prepared for future)
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
    enabled: isAdmin,
  });
  
  // Count stats directly from domains array
  const totalDomains = domains.length;
  const soldDomains = domains.filter(domain => domain.isSold).length;
  const totalViews = domains.reduce((sum, domain) => sum + (domain.viewCount || 0), 0);
  const totalRevenue = domains
    .filter(domain => domain.isSold)
    .reduce((sum, domain) => sum + domain.price, 0);
  const averagePrice = soldDomains > 0 
    ? totalRevenue / soldDomains 
    : 0;
  
  // Convert rate calculation 
  const conversionRate = totalDomains > 0 
    ? (soldDomains / totalDomains) * 100
    : 0;
    
  // Logout handler
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Force a full reload to ensure clean state
        window.location.href = '/';
      }
    });
  };
    
  // Show loading state
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
  
  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your domain listings, track offers, and monitor website stats</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-4 md:mt-0 border-black" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDomains}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Domains Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{soldDomains}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">From sold domains</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-500 mt-1">Per domain</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">Domains sold / total domains</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="website">Website Editor</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="ebooks">Ebook Files</TabsTrigger>
        </TabsList>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Domain Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.slice(0, 10).map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100">
                        <Tag className="h-3 w-3 mr-1 text-gray-500" />
                        {domain.category}
                      </span>
                    </TableCell>
                    <TableCell>${domain.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {domain.isSold ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          <CircleCheck className="h-3 w-3 mr-1" />
                          Sold
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          Available
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                        {!domain.isSold && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {domains.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No domains found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* OFFERS TAB */}
        <TabsContent value="offers" className="space-y-4">
          <h2 className="text-xl font-bold text-black">Domain Offers</h2>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Offer Amount</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No offers received yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* CONSULTATIONS TAB */}
        <TabsContent value="consultations" className="space-y-4">
          <h2 className="text-xl font-bold text-black">Domain Finder Consultations</h2>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell className="font-medium">{consultation.name}</TableCell>
                    <TableCell>{consultation.email}</TableCell>
                    <TableCell>{consultation.businessType}</TableCell>
                    <TableCell>${consultation.budget}</TableCell>
                    <TableCell>{new Date(consultation.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {consultations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No consultation requests received yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* PAGE CONTENT TAB */}
        <TabsContent value="content" className="space-y-4">
          <h2 className="text-xl font-bold text-black">Page Content Management</h2>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.pageKey}</TableCell>
                    <TableCell>{content.title}</TableCell>
                    <TableCell>{new Date(content.updatedAt || content.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pageContents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No page content found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* WEBSITE EDITOR TAB */}
        <TabsContent value="website" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Website Editor</h2>
            <Button variant="outline">Preview Site</Button>
          </div>
          
          <Tabs defaultValue="homepage" className="w-full">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="about">About Page</TabsTrigger>
              <TabsTrigger value="guide">Guide Page</TabsTrigger>
              <TabsTrigger value="contact">Contact Page</TabsTrigger>
              <TabsTrigger value="global">Global Elements</TabsTrigger>
            </TabsList>
            <TabsContent value="homepage" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Homepage Content</CardTitle>
                  <CardDescription>
                    Update your homepage sections, images, and text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Hero Section</h3>
                      <p className="text-sm text-gray-500">
                        Edit your main hero banner, headline and call-to-action
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit Section
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Featured Domains</h3>
                      <p className="text-sm text-gray-500">
                        Choose which domains to highlight on your homepage
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit Section
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Benefits Section</h3>
                      <p className="text-sm text-gray-500">
                        Update the value proposition and benefits of your service
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit Section
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="guide" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Guide Page</CardTitle>
                  <CardDescription>
                    Update your domain guide content and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit Guide Content
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="about" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit About Page</CardTitle>
                  <CardDescription>
                    Update your about page content and team information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit About Content
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Contact Page</CardTitle>
                  <CardDescription>
                    Update your contact information and form settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit Contact Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="global" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Site Elements</CardTitle>
                  <CardDescription>
                    Edit elements that appear on all pages like header and footer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Header Navigation</h3>
                      <p className="text-sm text-gray-500">
                        Edit your main menu links and header appearance
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit Header
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Footer Content</h3>
                      <p className="text-sm text-gray-500">
                        Update your footer links, copyright text and social media
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit Footer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* EMAIL SUBMISSIONS TAB */}
        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Email Submissions</h2>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.email}</TableCell>
                    <TableCell>{submission.source || "Ebook Download"}</TableCell>
                    <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {emailSubmissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No email submissions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* SEO SETTINGS TAB */}
        <TabsContent value="seo" className="space-y-4">
          <h2 className="text-xl font-bold text-black">SEO Settings</h2>
          
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seoSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.pageKey}</TableCell>
                    <TableCell className="max-w-xs truncate">{setting.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{setting.description}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {seoSettings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No SEO settings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* EBOOK FILES TAB */}
        <TabsContent value="ebooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Ebook Files</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Ebook
            </Button>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Domain Name Guide</CardTitle>
                <CardDescription>
                  The complete guide to domain name acquisition and investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Format: PDF | Size: 2.4 MB | Version: 1.0
                    </p>
                    <p className="text-sm mt-1">Downloads: 27</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Preview</Button>
                    <Button variant="outline" size="sm">Replace</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center text-sm text-gray-500 italic mt-4">
              Upload additional ebooks using the button above
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}