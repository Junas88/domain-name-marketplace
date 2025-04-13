import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertCircle,
  BarChart as BarChartIcon,
  Check,
  DollarSign,
  EyeIcon,
  FileText,
  FileUp,
  LineChart,
  Link as LinkIcon,
  Loader2,
  LogOut,
  PenIcon,
  PlusIcon,
  RefreshCw,
  TagIcon,
  TrashIcon
} from "lucide-react";
import FileUploader from "@/components/admin/FileUploader";
import EmailSubmissionsTable from "@/components/admin/EmailSubmissionsTable";
import InquiryManagement from "@/components/admin/InquiryManagement";
import { Domain, Offer, Consultation, PageContent, SeoSettings } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

// Schema for adding/editing domains
const domainFormSchema = z.object({
  name: z.string().min(3, "Domain name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  length: z.coerce.number().min(3, "Length must be at least 3 characters"),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

// Schema for adding/editing page content
const pageContentFormSchema = z.object({
  pageKey: z.string().min(3, "Page key must be at least 3 characters"),
  title: z.string().min(3, "Page title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Schema for adding/editing SEO settings
const seoSettingsFormSchema = z.object({
  pageKey: z.string().min(3, "Page key must be at least 3 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  metaDescription: z.string().min(10, "Meta description must be at least 10 characters"),
  metaKeywords: z.string().min(3, "Meta keywords must be at least 3 characters"),
  structuredData: z.string().optional(),
});

type PageContentFormValues = z.infer<typeof pageContentFormSchema>;

// Type for SEO settings form values
type SeoSettingsFormValues = z.infer<typeof seoSettingsFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("domains");
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<null | any>(null);
  const [showPageContentDialog, setShowPageContentDialog] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState<null | PageContent>(null);
  const [showSeoSettingsDialog, setShowSeoSettingsDialog] = useState(false);
  const [editingSeoSettings, setEditingSeoSettings] = useState<null | SeoSettings>(null);
  const { toast } = useToast();
  const { user, isLoading, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Authentication check - redirect to login if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
      return;
    }

    // Reset redirecting state if user is authenticated
    if (user?.isAdmin) {
      setIsRedirecting(false);
    }
  }, [user, isLoading]);
  
  // Fetch all domains - IMPORTANT: Keep all hooks at the top level for React's rules of hooks
  const { data: domains = [], isLoading: isLoadingDomains, refetch: refetchDomains } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });
  
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
  
  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

  // Type for domain stats
  interface DomainStats {
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
    totalRevenue: number;
    averagePrice: number;
    averageViews: number;
    mostViewedDomains: Array<{ id: number, name: string, viewCount: number, price: number }>;
    revenueByCategory: Record<string, number>;
    averagePriceByCategory: Record<string, number>;
    conversionRate: number;
    performanceByLength: Array<{ length: number, count: number, averagePrice: number, averageViews: number }>;
  }

  // Interface for offer with domain name included
  interface OfferWithDomain extends Offer {
    domainName: string;
  }
  
  // Fetch domain stats - All useQuery hooks MUST be before any conditional returns
  const { data: stats = { 
    totalDomains: 0, 
    soldDomains: 0, 
    totalViews: 0, 
    domainsByCategory: {},
    totalRevenue: 0,
    averagePrice: 0,
    averageViews: 0,
    mostViewedDomains: [],
    revenueByCategory: {},
    averagePriceByCategory: {},
    conversionRate: 0,
    performanceByLength: []
  }, isLoading: isLoadingStats } = useQuery<DomainStats>({
    queryKey: ['/api/admin/domains/stats'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });

  // Fetch all offers
  const { data: offers = [], isLoading: isLoadingOffers } = useQuery<OfferWithDomain[]>({
    queryKey: ['/api/admin/offers'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });

  // Fetch all consultations
  const { data: consultations = [], isLoading: isLoadingConsultations } = useQuery<Consultation[]>({
    queryKey: ['/api/admin/consultations'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });
  
  // Fetch all page content
  const { data: pageContents = [], isLoading: isLoadingPageContents, refetch: refetchPageContents } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });
  
  // Fetch all SEO settings
  const { data: seoSettings = [], isLoading: isLoadingSeoSettings, refetch: refetchSeoSettings } = useQuery<SeoSettings[]>({
    queryKey: ['/api/admin/seo-settings'],
    enabled: !!user?.isAdmin, // Only run query if user is admin
  });

  // Form for adding/editing page content
  const pageContentForm = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentFormSchema),
    defaultValues: editingPageContent ? {
      pageKey: editingPageContent.pageKey,
      title: editingPageContent.title,
      content: editingPageContent.content,
      metaTitle: editingPageContent.metaTitle || "",
      metaDescription: editingPageContent.metaDescription || "",
    } : {
      pageKey: "",
      title: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
    }
  });
  
  // Form for adding/editing SEO settings
  const seoSettingsForm = useForm<SeoSettingsFormValues>({
    resolver: zodResolver(seoSettingsFormSchema),
    defaultValues: editingSeoSettings ? {
      pageKey: editingSeoSettings.pageKey,
      title: editingSeoSettings.title,
      metaDescription: editingSeoSettings.metaDescription,
      metaKeywords: editingSeoSettings.metaKeywords,
      structuredData: editingSeoSettings.structuredData || "",
    } : {
      pageKey: "",
      title: "",
      metaDescription: "",
      metaKeywords: "",
      structuredData: "",
    }
  });
  
  // Effect to update pageContentForm when editingPageContent changes
  useEffect(() => {
    if (editingPageContent) {
      pageContentForm.reset({
        pageKey: editingPageContent.pageKey,
        title: editingPageContent.title,
        content: editingPageContent.content,
        metaTitle: editingPageContent.metaTitle || "",
        metaDescription: editingPageContent.metaDescription || "",
      });
    }
  }, [editingPageContent, pageContentForm]);
  
  // Effect to update seoSettingsForm when editingSeoSettings changes
  useEffect(() => {
    if (editingSeoSettings) {
      seoSettingsForm.reset({
        pageKey: editingSeoSettings.pageKey,
        title: editingSeoSettings.title,
        metaDescription: editingSeoSettings.metaDescription,
        metaKeywords: editingSeoSettings.metaKeywords,
        structuredData: editingSeoSettings.structuredData || "",
      });
    }
  }, [editingSeoSettings, seoSettingsForm]);
  
  // Handle form submission for adding/editing page content
  const onPageContentSubmit = async (data: PageContentFormValues) => {
    try {
      if (editingPageContent) {
        // Update existing page content
        await apiRequest(`/api/admin/page-contents/${editingPageContent.pageKey}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast({
          title: "Page Content Updated",
          description: `${data.title} has been updated successfully.`,
        });
      } else {
        // Add new page content
        await apiRequest("/api/admin/page-contents", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast({
          title: "Page Content Added",
          description: `${data.title} has been added successfully.`,
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Reset form and close dialog
      pageContentForm.reset();
      setShowPageContentDialog(false);
      setEditingPageContent(null);
    } catch (error) {
      console.error("Error saving page content:", error);
      toast({
        title: "Error",
        description: "Failed to save page content. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting page content
  const handleDeletePageContent = async (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete this page content?")) {
      try {
        await apiRequest(`/api/admin/page-contents/${pageKey}`, {
          method: "DELETE",
        });
        
        toast({
          title: "Page Content Deleted",
          description: "The page content has been deleted successfully.",
        });
        
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      } catch (error) {
        console.error("Error deleting page content:", error);
        toast({
          title: "Error",
          description: "Failed to delete page content. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Form for adding/editing domains
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: editingDomain || {
      name: "",
      description: "",
      price: 0,
      category: "",
      length: 0,
    }
  });

  // Effect to update form when editingDomain changes
  useEffect(() => {
    if (editingDomain) {
      form.reset({
        name: editingDomain.name,
        description: editingDomain.description,
        price: editingDomain.price,
        category: editingDomain.category,
        length: editingDomain.length,
      });
    }
  }, [editingDomain, form]);

  // Handle form submission for adding/editing domains
  const onSubmit = async (data: DomainFormValues) => {
    try {
      if (editingDomain) {
        // Update existing domain
        await apiRequest(`/api/admin/domains/${editingDomain.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast({
          title: "Domain Updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Add new domain
        await apiRequest("/api/admin/domains", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast({
          title: "Domain Added",
          description: `${data.name} has been added successfully.`,
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      
      // Reset form and close dialog
      form.reset();
      setShowAddDomainDialog(false);
      setEditingDomain(null);
    } catch (error) {
      console.error("Error saving domain:", error);
      toast({
        title: "Error",
        description: "Failed to save domain. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a domain
  const handleDeleteDomain = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      try {
        await apiRequest(`/api/admin/domains/${id}`, {
          method: "DELETE",
        });
        
        toast({
          title: "Domain Deleted",
          description: "The domain has been deleted successfully.",
        });
        
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      } catch (error) {
        console.error("Error deleting domain:", error);
        toast({
          title: "Error",
          description: "Failed to delete domain. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle marking a domain as sold
  const handleMarkAsSold = async (id: number) => {
    try {
      await apiRequest(`/api/admin/domains/${id}/mark-sold`, {
        method: "PATCH",
      });
      
      toast({
        title: "Domain Marked as Sold",
        description: "The domain has been marked as sold successfully.",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
    } catch (error) {
      console.error("Error marking domain as sold:", error);
      toast({
        title: "Error",
        description: "Failed to mark domain as sold. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for adding/editing SEO settings
  const onSeoSettingsSubmit = async (data: SeoSettingsFormValues) => {
    try {
      if (editingSeoSettings) {
        // Update existing SEO settings
        await apiRequest(`/api/admin/seo-settings/${editingSeoSettings.pageKey}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast({
          title: "SEO Settings Updated",
          description: `SEO settings for ${data.pageKey} have been updated successfully.`,
        });
      } else {
        // Add new SEO settings
        await apiRequest("/api/admin/seo-settings", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast({
          title: "SEO Settings Added",
          description: `SEO settings for ${data.pageKey} have been added successfully.`,
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      
      // Reset form and close dialog
      seoSettingsForm.reset();
      setShowSeoSettingsDialog(false);
      setEditingSeoSettings(null);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting SEO settings
  const handleDeleteSeoSettings = async (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete these SEO settings?")) {
      try {
        await apiRequest(`/api/admin/seo-settings/${pageKey}`, {
          method: "DELETE",
        });
        
        toast({
          title: "SEO Settings Deleted",
          description: "The SEO settings have been deleted successfully.",
        });
        
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      } catch (error) {
        console.error("Error deleting SEO settings:", error);
        toast({
          title: "Error",
          description: "Failed to delete SEO settings. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Format category data for the chart
  const categoryChartData = Object.entries(stats.domainsByCategory || {}).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your domain listings, track offers, and monitor website stats</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0 border-black" 
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                navigate('/');
              }
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <Tabs defaultValue="search-console" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-11 mb-6 overflow-x-auto">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
          <TabsTrigger value="google-analytics">Google Analytics</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
        </TabsList>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          {/* Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Domains by Category</CardTitle>
              <CardDescription>Distribution of domains across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Domain Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Domain Listings</CardTitle>
                <CardDescription>Manage your domain inventory</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refetchDomains()} 
                  variant="outline" 
                  size="icon"
                  className="border-black"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingDomain(null);
                        form.reset({
                          name: "",
                          description: "",
                          price: 0,
                          category: "",
                          length: 0,
                        });
                      }}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Domain
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Domain Name</FormLabel>
                              <FormControl>
                                <Input placeholder="example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the domain and its potential uses..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="length"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Length</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Technology">Technology</SelectItem>
                                  <SelectItem value="Health">Health</SelectItem>
                                  <SelectItem value="Finance">Finance</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                                  <SelectItem value="Business">Business</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowAddDomainDialog(false);
                              setEditingDomain(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            {editingDomain ? "Update Domain" : "Add Domain"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDomains ? (
                <div className="text-center py-4">Loading domains...</div>
              ) : domains.length === 0 ? (
                <div className="text-center py-4">No domains found. Add one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {domains.map((domain: any) => (
                        <TableRow key={domain.id}>
                          <TableCell className="font-medium">{domain.name}</TableCell>
                          <TableCell>{domain.category}</TableCell>
                          <TableCell>${domain.price.toLocaleString()}</TableCell>
                          <TableCell>{domain.viewCount || 0}</TableCell>
                          <TableCell>
                            {domain.isSold ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Sold
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Available
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingDomain(domain);
                                  setShowAddDomainDialog(true);
                                }}
                                title="Edit Domain"
                              >
                                <PenIcon className="h-4 w-4" />
                              </Button>
                              {!domain.isSold && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleMarkAsSold(domain.id)}
                                  title="Mark as Sold"
                                >
                                  <TagIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteDomain(domain.id)}
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                title="Delete Domain"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* INQUIRIES TAB */}
        <TabsContent value="inquiries" className="space-y-6">
          <InquiryManagement />
        </TabsContent>
        
        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Revenue and Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">From sold domains</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${Math.round(stats.averagePrice).toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">Per domain</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                <p className="text-sm text-gray-500 mt-1">Domains sold / total domains</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.averageViews.toFixed(1)}</div>
                <p className="text-sm text-gray-500 mt-1">Per domain</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Performing Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Most Viewed Domains</CardTitle>
              <CardDescription>Your most popular domain listings by number of views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain Name</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Interest Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.mostViewedDomains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>{domain.viewCount}</TableCell>
                        <TableCell>${domain.price.toLocaleString()}</TableCell>
                        <TableCell>
                          {(domain.viewCount / (stats.totalViews || 1) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Performance By Length */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Performance by Length</CardTitle>
              <CardDescription>Analysis of domain metrics grouped by character length</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.performanceByLength}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="length" label={{value: 'Domain Length (characters)', position: 'insideBottom', offset: -5}} />
                    <YAxis yAxisId="left" orientation="left" stroke="#000000" label={{value: 'Number of Domains', angle: -90, position: 'insideLeft'}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888888" label={{value: 'Average Price ($)', angle: -90, position: 'insideRight'}} />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar yAxisId="left" dataKey="count" name="Number of Domains" fill="#000000" />
                    <Bar yAxisId="right" dataKey="averagePrice" name="Average Price ($)" fill="#888888" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Category Revenue Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>How different domain categories contribute to revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={Object.entries(stats.revenueByCategory).map(([category, revenue]) => ({
                      category,
                      revenue,
                      avgPrice: stats.averagePriceByCategory[category] || 0
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" orientation="left" stroke="#000000" label={{value: 'Total Revenue ($)', angle: -90, position: 'insideLeft'}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888888" label={{value: 'Average Price ($)', angle: -90, position: 'insideRight'}} />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="#000000" />
                    <Bar yAxisId="right" dataKey="avgPrice" name="Average Price" fill="#888888" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* OFFERS TAB */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Offers</CardTitle>
              <CardDescription>All offers made on your domain listings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOffers ? (
                <div className="text-center py-4">Loading offers...</div>
              ) : offers.length === 0 ? (
                <div className="text-center py-4">No offers received yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Offer Amount</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer: any) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.domainName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{offer.name}</span>
                              <span className="text-xs text-gray-500">{offer.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>${offer.amount.toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{offer.message || "No message"}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* CONSULTATIONS TAB */}
        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Consultations</CardTitle>
              <CardDescription>All consultation requests from potential clients</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingConsultations ? (
                <div className="text-center py-4">Loading consultations...</div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-4">No consultation requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultations.map((consultation: any) => (
                        <TableRow key={consultation.id}>
                          <TableCell className="font-medium">{consultation.name}</TableCell>
                          <TableCell>{consultation.email}</TableCell>
                          <TableCell>{consultation.industry}</TableCell>
                          <TableCell>{consultation.budget}</TableCell>
                          <TableCell className="max-w-xs truncate">{consultation.message}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(consultation.createdAt), { addSuffix: true })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PAGE CONTENT CMS TAB */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Page Content Management</CardTitle>
                <CardDescription>Edit and manage website page content</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => refetchPageContents()}
                  variant="outline"
                  size="icon"
                  className="border-black"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      // First find the ebook section entry
                      const ebookSection = pageContents.find(p => p.pageKey === 'ebook-section');
                      
                      if (ebookSection) {
                        // Update the content to remove pricing information
                        const updatedContent = ebookSection.content
                          .replace(/<p>Regular price: \$49\.95<\/p>/g, '')
                          .replace(/<p>Special offer: \$29\.95<\/p>/g, '');
                        
                        // Update via API
                        await apiRequest(`/api/admin/page-contents/ebook-section`, {
                          method: 'PATCH',
                          body: JSON.stringify({
                            content: updatedContent,
                            isPurchaseRequired: false,
                            price: 0
                          })
                        });
                        
                        toast({
                          title: "Ebook Settings Fixed",
                          description: "The ebook is now set to free with updated content.",
                        });
                        
                        // Refresh data
                        refetchPageContents();
                      }
                    } catch (error) {
                      console.error("Error fixing ebook settings:", error);
                      toast({
                        title: "Error",
                        description: "Failed to fix ebook settings. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Fix Ebook Settings
                </Button>
                <Dialog open={showPageContentDialog} onOpenChange={setShowPageContentDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingPageContent(null);
                        pageContentForm.reset({
                          pageKey: "",
                          title: "",
                          content: "",
                          metaTitle: "",
                          metaDescription: ""
                        });
                      }}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPageContent ? "Edit Page Content" : "Add New Page Content"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...pageContentForm}>
                      <form onSubmit={pageContentForm.handleSubmit(onPageContentSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={pageContentForm.control}
                            name="pageKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Key</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="home-page" 
                                    {...field}
                                    disabled={!!editingPageContent}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Unique identifier for this page (no spaces)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pageContentForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Home Page" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={pageContentForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter page content here. Supports HTML." 
                                  {...field}
                                  className="min-h-40" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={pageContentForm.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title (SEO)</FormLabel>
                              <FormControl>
                                <Input placeholder="Meta title for SEO purposes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={pageContentForm.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description (SEO)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Meta description for SEO purposes" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowPageContentDialog(false);
                              setEditingPageContent(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            {editingPageContent ? "Update Page" : "Add Page"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPageContents ? (
                <div className="text-center py-4">Loading page content...</div>
              ) : pageContents.length === 0 ? (
                <div className="text-center py-4">No page content found. Add one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page Key</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageContents.map((pageContent) => (
                        <TableRow key={pageContent.id}>
                          <TableCell className="font-medium">{pageContent.pageKey}</TableCell>
                          <TableCell>{pageContent.title}</TableCell>
                          <TableCell>
                            {pageContent.updatedAt ? formatDistanceToNow(new Date(pageContent.updatedAt), { addSuffix: true }) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingPageContent(pageContent);
                                  setShowPageContentDialog(true);
                                }}
                                title="Edit Page Content"
                              >
                                <PenIcon className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-200 text-blue-500 hover:bg-blue-50"
                                    title="Preview Content"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Preview: {pageContent.title}</DialogTitle>
                                    <DialogDescription>
                                      Content preview for page key: {pageContent.pageKey}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 border p-4 rounded-md bg-white overflow-auto max-h-[60vh]">
                                    <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
                                  </div>
                                  <div className="mt-4 space-y-2">
                                    <div className="text-sm font-medium">Meta Title:</div>
                                    <div className="text-sm bg-gray-100 p-2 rounded">{pageContent.metaTitle || 'None'}</div>
                                    <div className="text-sm font-medium">Meta Description:</div>
                                    <div className="text-sm bg-gray-100 p-2 rounded">{pageContent.metaDescription || 'None'}</div>
                                    
                                    {pageContent.filePath && (
                                      <>
                                        <div className="text-sm font-medium mt-4">Attached File:</div>
                                        <div className="text-sm bg-gray-100 p-2 rounded">
                                          {pageContent.fileName}
                                          {pageContent.fileSize && <span className="ml-2">({(pageContent.fileSize / 1024 / 1024).toFixed(2)} MB)</span>}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {pageContent.pageKey === 'ebook-section' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="border-purple-200 text-purple-500 hover:bg-purple-50"
                                      title="Upload E-book File"
                                    >
                                      <FileUp className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Upload E-book File</DialogTitle>
                                      <DialogDescription>
                                        Upload a PDF file for the e-book that users can download for free. This will replace the current PDF.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <FileUploader 
                                      pageKey={pageContent.pageKey} 
                                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] })}
                                    />
                                  </DialogContent>
                                </Dialog>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeletePageContent(pageContent.pageKey)}
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                title="Delete Page Content"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL SUBMISSIONS TAB */}
        <TabsContent value="emails" className="space-y-6">
          <EmailSubmissionsTable />
        </TabsContent>
        
        {/* SEO SETTINGS TAB */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage SEO metadata for website pages</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refetchSeoSettings()} 
                  variant="outline" 
                  size="icon"
                  className="border-black"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={showSeoSettingsDialog} onOpenChange={setShowSeoSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingSeoSettings(null);
                        seoSettingsForm.reset({
                          pageKey: "",
                          title: "",
                          metaDescription: "",
                          metaKeywords: "",
                          structuredData: "",
                        });
                      }}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add SEO Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingSeoSettings ? "Edit SEO Settings" : "Add New SEO Settings"}</DialogTitle>
                      <DialogDescription>
                        Configure SEO metadata for better search engine visibility
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...seoSettingsForm}>
                      <form onSubmit={seoSettingsForm.handleSubmit(onSeoSettingsSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={seoSettingsForm.control}
                            name="pageKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Key</FormLabel>
                                <FormControl>
                                  <Input placeholder="home" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Unique identifier for the page (e.g., home, about, contact)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={seoSettingsForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title Tag</FormLabel>
                                <FormControl>
                                  <Input placeholder="Page Title - Domain Name Guide" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The main title that appears in search results
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={seoSettingsForm.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the page content..." 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                A concise description that appears in search results
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={seoSettingsForm.control}
                          name="metaKeywords"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Keywords</FormLabel>
                              <FormControl>
                                <Input placeholder="domain, marketplace, investment" {...field} />
                              </FormControl>
                              <FormDescription>
                                Comma-separated keywords relevant to the page
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={seoSettingsForm.control}
                          name="structuredData"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Structured Data JSON-LD</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}' 
                                  className="h-32 font-mono text-sm" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Advanced: JSON-LD structured data for rich results
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowSeoSettingsDialog(false);
                              setEditingSeoSettings(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            {editingSeoSettings ? "Update SEO Settings" : "Save SEO Settings"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSeoSettings ? (
                <div className="text-center py-4">Loading SEO settings...</div>
              ) : seoSettings.length === 0 ? (
                <div className="text-center py-4">No SEO settings found. Add some to optimize your pages!</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page Key</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Meta Description</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seoSettings.map((seo) => (
                        <TableRow key={seo.id}>
                          <TableCell className="font-medium">{seo.pageKey}</TableCell>
                          <TableCell className="max-w-xs truncate">{seo.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{seo.metaDescription}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(seo.updatedAt), { addSuffix: true })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingSeoSettings(seo);
                                  setShowSeoSettingsDialog(true);
                                }}
                                title="Edit SEO Settings"
                              >
                                <PenIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteSeoSettings(seo.pageKey)}
                                title="Delete SEO Settings"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* GOOGLE SEARCH CONSOLE TAB */}
        <TabsContent value="search-console" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Search Console</CardTitle>
              <CardDescription>Monitor your site's performance in Google search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status Card */}
              <div className="rounded-lg border p-6 bg-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">Connection Status</h3>
                    <div className="flex items-center">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your Google Search Console account to monitor search performance
                    </p>
                  </div>
                  <Button className="bg-[#4285F4] hover:bg-[#3367d6] text-white">
                    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Connect with Google
                  </Button>
                </div>
              </div>
              
              {/* Performance Overview Placeholder */}
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Performance Overview</h3>
                  <Select defaultValue="28days">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="28days">Last 28 days</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                      <SelectItem value="6months">Last 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <div className="text-center space-y-2">
                    <LineChart className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">Performance data will appear here after connecting</p>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Top Queries Placeholder */}
              <div className="rounded-lg border p-6">
                <h3 className="font-medium text-lg mb-4">Top Queries</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Connect to Google Search Console to view your top search queries
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* GOOGLE ANALYTICS TAB */}
        <TabsContent value="google-analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription>Track and analyze your website traffic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status Card */}
              <div className="rounded-lg border p-6 bg-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">Connection Status</h3>
                    <div className="flex items-center">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your Google Analytics account to track visitor behavior
                    </p>
                  </div>
                  <Button className="bg-[#4285F4] hover:bg-[#3367d6] text-white">
                    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Connect with Google
                  </Button>
                </div>
              </div>
              
              {/* Traffic Overview Placeholder */}
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Traffic Overview</h3>
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">Today</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <div className="text-center space-y-2">
                    <BarChart className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">Traffic data will appear here after connecting</p>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Acquisition Channels Placeholder */}
              <div className="rounded-lg border p-6">
                <h3 className="font-medium text-lg mb-4">Acquisition Channels</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Bounce Rate</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Connect to Google Analytics to view your acquisition channels
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* GOOGLE ADSENSE TAB */}
        <TabsContent value="adsense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense</CardTitle>
              <CardDescription>Monitor your ad revenue and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status Card */}
              <div className="rounded-lg border p-6 bg-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">Connection Status</h3>
                    <div className="flex items-center">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your Google AdSense account to track ad performance and revenue
                    </p>
                  </div>
                  <Button className="bg-[#4285F4] hover:bg-[#3367d6] text-white">
                    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Connect with Google
                  </Button>
                </div>
              </div>
              
              {/* Revenue Overview Placeholder */}
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Revenue Overview</h3>
                  <Select defaultValue="month">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Page RPM</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-gray-500 mt-1">Connect to view data</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <div className="text-center space-y-2">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">Revenue data will appear here after connecting</p>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Top Earning Pages Placeholder */}
              <div className="rounded-lg border p-6">
                <h3 className="font-medium text-lg mb-4">Top Earning Pages</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Estimated Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Connect to Google AdSense to view your top earning pages
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}