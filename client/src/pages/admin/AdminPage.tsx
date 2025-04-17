import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { 
  Check, 
  Database,
  Download,
  EyeIcon, 
  FileText, 
  Loader2, 
  LogOut, 
  PenIcon, 
  PlusIcon,
  Search,
  SlidersHorizontal,
  TagIcon, 
  Trash2,
  TrashIcon,
  X
} from "lucide-react";
import EmailSubmissionsTable from "@/components/admin/EmailSubmissionsTable";
import BackupRestore from "@/components/admin/BackupRestore";
import { Domain, PageContent, SeoSettings, Consultation } from "@/lib/types";
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
type SeoSettingsFormValues = z.infer<typeof seoSettingsFormSchema>;

export default function AdminPage() {
  // State
  const [activeTab, setActiveTab] = useState("domains");
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [showPageContentDialog, setShowPageContentDialog] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState<PageContent | null>(null);
  const [showSeoSettingsDialog, setShowSeoSettingsDialog] = useState(false);
  const [editingSeoSettings, setEditingSeoSettings] = useState<SeoSettings | null>(null);
  const [domainSearch, setDomainSearch] = useState("");
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  
  // Hooks
  const { toast } = useToast();
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [, navigate] = useLocation();
  
  // Auth check - redirect to login if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to login page");
      setIsRedirecting(true);
      
      setTimeout(() => {
        navigate("/login");
      }, 300);
    }
  }, [user, isLoading, navigate]);
  
  // Define stats type
  type DomainStats = {
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
    totalRevenue: number;
    averagePrice: number;
    mostViewedDomains?: Array<{
      id: number;
      name: string;
      viewCount: number;
      price: number;
    }>;
  };

  // Fetch data - all queries must be before any conditional returns
  // and all enabled by admin check
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: !!user?.isAdmin,
  });
  
  const { data: stats = { 
    totalDomains: 0, 
    soldDomains: 0, 
    totalViews: 0,
    domainsByCategory: {},
    totalRevenue: 0,
    averagePrice: 0
  } } = useQuery<DomainStats>({
    queryKey: ['/api/admin/domains/stats'],
    enabled: !!user?.isAdmin,
  });
  
  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ['/api/admin/consultations'],
    enabled: !!user?.isAdmin,
  });
  
  const { data: pageContents = [] } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
    enabled: !!user?.isAdmin,
  });
  
  const { data: seoSettings = [] } = useQuery<SeoSettings[]>({
    queryKey: ['/api/admin/seo-settings'],
    enabled: !!user?.isAdmin,
  });
  
  // Form for adding/editing page content
  const pageContentForm = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentFormSchema),
    defaultValues: {
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
    defaultValues: {
      pageKey: "",
      title: "",
      metaDescription: "",
      metaKeywords: "",
      structuredData: "",
    }
  });
  
  // Form for adding/editing domains
  const domainForm = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      length: 0,
    }
  });
  
  // Effect to update form when editing domain/content/settings
  useEffect(() => {
    if (editingDomain) {
      domainForm.reset({
        name: editingDomain.name,
        description: editingDomain.description,
        price: editingDomain.price,
        category: editingDomain.category,
        length: editingDomain.length,
      });
    }
  }, [editingDomain, domainForm]);
  
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

  // Mutations
  const addDomainMutation = useMutation({
    mutationFn: async (data: DomainFormValues) => {
      const res = await apiRequest("/api/admin/domains", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      setShowAddDomainDialog(false);
      domainForm.reset();
      toast({
        title: "Domain Added",
        description: "The domain has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: async (data: { id: number; domain: DomainFormValues }) => {
      const res = await apiRequest(`/api/admin/domains/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.domain),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      setShowAddDomainDialog(false);
      setEditingDomain(null);
      domainForm.reset();
      toast({
        title: "Domain Updated",
        description: "The domain has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/domains/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      toast({
        title: "Domain Deleted",
        description: "The domain has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const markAsSoldMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/domains/${id}/mark-sold`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/domains/stats'] });
      toast({
        title: "Domain Marked as Sold",
        description: "The domain has been marked as sold successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to mark domain as sold: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addPageContentMutation = useMutation({
    mutationFn: async (data: PageContentFormValues) => {
      const res = await apiRequest("/api/admin/page-contents", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate the admin page contents list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Also invalidate the public API endpoint for this specific page content
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${data.pageKey}`] });

      setShowPageContentDialog(false);
      pageContentForm.reset();
      toast({
        title: "Page Content Added",
        description: "The page content has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add page content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updatePageContentMutation = useMutation({
    mutationFn: async (data: { pageKey: string; content: PageContentFormValues }) => {
      const res = await apiRequest(`/api/admin/page-contents/${data.pageKey}`, {
        method: "PATCH",
        body: JSON.stringify(data.content),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate admin endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Also invalidate the public API endpoint for this specific page content
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${variables.pageKey}`] });
      
      setShowPageContentDialog(false);
      setEditingPageContent(null);
      pageContentForm.reset();
      toast({
        title: "Page Content Updated",
        description: "The page content has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update page content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deletePageContentMutation = useMutation({
    mutationFn: async (pageKey: string) => {
      await apiRequest(`/api/admin/page-contents/${pageKey}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, pageKey) => {
      // Invalidate admin endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Also invalidate the public API endpoint for this specific page content
      queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${pageKey}`] });
      
      toast({
        title: "Page Content Deleted",
        description: "The page content has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete page content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addSeoSettingsMutation = useMutation({
    mutationFn: async (data: SeoSettingsFormValues) => {
      const res = await apiRequest("/api/admin/seo-settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate admin endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      
      // Also invalidate the public API endpoint for this specific SEO setting
      queryClient.invalidateQueries({ queryKey: [`/api/seo-settings/${data.pageKey}`] });
      
      setShowSeoSettingsDialog(false);
      seoSettingsForm.reset();
      toast({
        title: "SEO Settings Added",
        description: "The SEO settings have been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add SEO settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateSeoSettingsMutation = useMutation({
    mutationFn: async (data: { pageKey: string; settings: SeoSettingsFormValues }) => {
      const res = await apiRequest(`/api/admin/seo-settings/${data.pageKey}`, {
        method: "PATCH",
        body: JSON.stringify(data.settings),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate admin endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      
      // Also invalidate the public API endpoint for this specific SEO setting
      queryClient.invalidateQueries({ queryKey: [`/api/seo-settings/${variables.pageKey}`] });
      
      setShowSeoSettingsDialog(false);
      setEditingSeoSettings(null);
      seoSettingsForm.reset();
      toast({
        title: "SEO Settings Updated",
        description: "The SEO settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update SEO settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteSeoSettingsMutation = useMutation({
    mutationFn: async (pageKey: string) => {
      await apiRequest(`/api/admin/seo-settings/${pageKey}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, pageKey) => {
      // Invalidate admin endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      
      // Also invalidate the public API endpoint for this specific SEO setting
      queryClient.invalidateQueries({ queryKey: [`/api/seo-settings/${pageKey}`] });
      
      toast({
        title: "SEO Settings Deleted",
        description: "The SEO settings have been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete SEO settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onDomainSubmit = (data: DomainFormValues) => {
    if (editingDomain) {
      updateDomainMutation.mutate({ id: editingDomain.id, domain: data });
    } else {
      addDomainMutation.mutate(data);
    }
  };

  const onPageContentSubmit = (data: PageContentFormValues) => {
    if (editingPageContent) {
      updatePageContentMutation.mutate({ pageKey: editingPageContent.pageKey, content: data });
    } else {
      addPageContentMutation.mutate(data);
    }
  };

  const onSeoSettingsSubmit = (data: SeoSettingsFormValues) => {
    if (editingSeoSettings) {
      updateSeoSettingsMutation.mutate({ pageKey: editingSeoSettings.pageKey, settings: data });
    } else {
      addSeoSettingsMutation.mutate(data);
    }
  };

  // Event handlers
  const handleDeleteDomain = (id: number) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      deleteDomainMutation.mutate(id);
    }
  };

  const handleMarkAsSold = (id: number) => {
    markAsSoldMutation.mutate(id);
  };

  const handleDeletePageContent = (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete this page content?")) {
      deletePageContentMutation.mutate(pageKey);
    }
  };

  const handleDeleteSeoSettings = (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete these SEO settings?")) {
      deleteSeoSettingsMutation.mutate(pageKey);
    }
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
  
  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

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
                // Force a full reload to ensure clean state
                window.location.href = '/';
              }
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

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
            <div className="text-3xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</div>
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
      
      {/* Most Viewed Domains Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Most Viewed Domains</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Domain Name</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.mostViewedDomains && stats.mostViewedDomains.length > 0 ? (
                  stats.mostViewedDomains.slice(0, 10).map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">{domain.name}</TableCell>
                      <TableCell>{domain.viewCount}</TableCell>
                      <TableCell>${domain.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const fullDomain = domains.find(d => d.id === domain.id);
                              if (fullDomain) {
                                setEditingDomain(fullDomain);
                                setShowAddDomainDialog(true);
                              }
                            }}
                          >
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/domain/${domain.id}`, '_blank')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No domains have been viewed yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="domains" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9 mb-6">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="site">Website Editor</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="ebooks">Ebook Files</TabsTrigger>
          <TabsTrigger value="backup">Backup/Restore</TabsTrigger>
        </TabsList>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-6">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Domain Management</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/admin/sync"}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Data Sync & Backup
              </Button>
              <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingDomain(null);
                      domainForm.reset({
                        name: "",
                        description: "",
                        price: 0,
                        category: "",
                        length: 0,
                      });
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
                  <DialogDescription>
                    Enter the details for the domain.
                  </DialogDescription>
                </DialogHeader>
                <Form {...domainForm}>
                  <form onSubmit={domainForm.handleSubmit(onDomainSubmit)} className="space-y-4">
                    <FormField
                      control={domainForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={domainForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={domainForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={domainForm.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (characters)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={domainForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="food">Food</SelectItem>
                              <SelectItem value="fashion">Fashion</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddDomainDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDomain ? "Update Domain" : "Add Domain"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end mb-4">
            <div className="flex-1">
              <Label htmlFor="domain-search">Search Domains</Label>
              <div className="flex items-center mt-1.5">
                <Input
                  id="domain-search"
                  type="text"
                  placeholder="Search by domain name..."
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="max-w-sm"
                />
                {domainSearch && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDomainSearch("")}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => setShowBulkOperations(!showBulkOperations)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" /> 
                {showBulkOperations ? "Hide Bulk Operations" : "Show Bulk Operations"}
              </Button>
            </div>
          </div>

          {showBulkOperations && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bulk Operations</CardTitle>
                <CardDescription>
                  Perform operations on multiple domains at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulk-category">Update Category</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Select>
                        <SelectTrigger id="bulk-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>Apply</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="domain-search">Search Domains</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input 
                        id="domain-search"
                        type="text" 
                        placeholder="Search by domain name..." 
                        className="w-full"
                        value={domainSearch}
                        onChange={(e) => setDomainSearch(e.target.value)}
                      />
                      {domainSearch && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setDomainSearch("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Quick Actions</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button variant="outline" className="flex items-center gap-1.5">
                        <Download className="h-4 w-4" /> Export
                      </Button>
                      <Button variant="outline" className="flex items-center gap-1.5 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
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
                {domains
                  .filter(domain => 
                    domainSearch === "" || 
                    domain.name.toLowerCase().includes(domainSearch.toLowerCase())
                  )
                  .map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {domain.category}
                      </span>
                    </TableCell>
                    <TableCell>${domain.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {domain.isSold ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Sold
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          Available
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingDomain(domain);
                            setShowAddDomainDialog(true);
                          }}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDomain(domain.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        {!domain.isSold && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsSold(domain.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* OFFERS TAB */}
        <TabsContent value="offers" className="space-y-6">
          <h2 className="text-xl font-bold">Domain Offers</h2>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Offer Amount</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* We'll fetch offers from the API in a future update */}
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No offers received yet.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Offer Statistics</CardTitle>
                <CardDescription>Overview of offers received and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Offers</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Avg. Offer Amount</span>
                    <span className="text-2xl font-bold">$0</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                    <span className="text-2xl font-bold">0%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Pending Offers</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WEBSITE EDITOR TAB */}
        <TabsContent value="site" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Complete Website Editor</h2>
            <Button variant="outline">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview Site
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <Tabs defaultValue="homepage">
                <TabsList className="mb-4">
                  <TabsTrigger value="homepage">Homepage</TabsTrigger>
                  <TabsTrigger value="about">About Page</TabsTrigger>
                  <TabsTrigger value="guide">Guide Page</TabsTrigger>
                  <TabsTrigger value="contact">Contact Page</TabsTrigger>
                  <TabsTrigger value="global">Global Elements</TabsTrigger>
                </TabsList>
                
                {/* HOMEPAGE EDITOR */}
                <TabsContent value="homepage">
                  <Card>
                    <CardHeader>
                      <CardTitle>Home Page Editor</CardTitle>
                      <CardDescription>Edit all sections of your home page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                            <AccordionTrigger><h3 className="text-base font-medium">Hero Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Heading</label>
                                  <Input 
                                    defaultValue="Find The Perfect Domain Name For Your Business" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subheading</label>
                                  <Input 
                                    defaultValue="Premium domains for startups and established businesses" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Button Text</label>
                                  <Input 
                                    defaultValue="Browse Domains" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Button Link</label>
                                  <Input 
                                    defaultValue="/domains" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-black rounded"></div>
                                    <Input defaultValue="#000000" className="w-32" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Text Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-white border rounded"></div>
                                    <Input defaultValue="#FFFFFF" className="w-32" />
                                  </div>
                                </div>
                                <div className="pt-2">
                                  <Button variant="outline" size="sm">
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Preview Hero Section
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-2">
                            <AccordionTrigger><h3 className="text-base font-medium">Domain Search Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Search Title</label>
                                  <Input 
                                    defaultValue="Find Your Perfect Domain" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Search Placeholder</label>
                                  <Input 
                                    defaultValue="Enter domain name or keyword..." 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Search Button Text</label>
                                  <Input 
                                    defaultValue="Search" 
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="enable-filters" defaultChecked />
                                  <label htmlFor="enable-filters">Enable category filters</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="enable-price" defaultChecked />
                                  <label htmlFor="enable-price">Enable price range filter</label>
                                </div>
                                <div className="pt-2">
                                  <Button variant="outline" size="sm">
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Preview Search Section
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-3">
                            <AccordionTrigger><h3 className="text-base font-medium">Features Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Section Title</label>
                                  <Input 
                                    defaultValue="Why Choose DomainNameGuide" 
                                    className="mt-1"
                                  />
                                </div>
                                <div className="border rounded-md p-3 mt-3">
                                  <h4 className="text-sm font-medium mb-2">Feature 1</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Title</label>
                                      <Input 
                                        defaultValue="Premium Domains" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <Textarea 
                                        defaultValue="Handpicked premium domains ideal for businesses looking to establish a strong online presence."
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Icon</label>
                                      <Select defaultValue="star">
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="star">Star</SelectItem>
                                          <SelectItem value="shield">Shield</SelectItem>
                                          <SelectItem value="check">Check</SelectItem>
                                          <SelectItem value="globe">Globe</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2">Feature 2</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Title</label>
                                      <Input 
                                        defaultValue="Secure Transactions" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <Textarea 
                                        defaultValue="100% secure payment processing and domain transfers with our buyer protection guarantee."
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Icon</label>
                                      <Select defaultValue="shield">
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="star">Star</SelectItem>
                                          <SelectItem value="shield">Shield</SelectItem>
                                          <SelectItem value="check">Check</SelectItem>
                                          <SelectItem value="globe">Globe</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2">Feature 3</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Title</label>
                                      <Input 
                                        defaultValue="Expert Support" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <Textarea 
                                        defaultValue="Our domain experts are available to help you find the perfect domain for your business."
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Icon</label>
                                      <Select defaultValue="headset">
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="star">Star</SelectItem>
                                          <SelectItem value="shield">Shield</SelectItem>
                                          <SelectItem value="headset">Headset</SelectItem>
                                          <SelectItem value="globe">Globe</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button variant="outline" size="sm">
                                  <PlusIcon className="h-4 w-4 mr-2" />
                                  Add New Feature
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-4">
                            <AccordionTrigger><h3 className="text-base font-medium">Recently Sold Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Section Title</label>
                                  <Input 
                                    defaultValue="Gone Fast – See What's Already Sold" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Number of Domains to Show</label>
                                  <Input 
                                    type="number"
                                    defaultValue="6" 
                                    className="mt-1 w-24"
                                  />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="auto-scroll" defaultChecked />
                                  <label htmlFor="auto-scroll">Enable auto-scrolling carousel</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="show-price" defaultChecked />
                                  <label htmlFor="show-price">Show selling price</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="show-date" defaultChecked />
                                  <label htmlFor="show-date">Show sale date</label>
                                </div>
                                <div className="pt-2 flex justify-between">
                                  <Button variant="outline" size="sm">
                                    <PenIcon className="h-4 w-4 mr-2" />
                                    Edit Carousel Settings
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Preview Carousel
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-5">
                            <AccordionTrigger><h3 className="text-base font-medium">Call to Action Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Heading</label>
                                  <Input 
                                    defaultValue="Ready to secure your perfect domain?" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subheading</label>
                                  <Input 
                                    defaultValue="Browse our premium selection or contact our experts for assistance" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Primary Button Text</label>
                                  <Input 
                                    defaultValue="Browse Domains" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Primary Button Link</label>
                                  <Input 
                                    defaultValue="/domains" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Secondary Button Text</label>
                                  <Input 
                                    defaultValue="Contact Us" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Secondary Button Link</label>
                                  <Input 
                                    defaultValue="/contact" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-gray-900 rounded"></div>
                                    <Input defaultValue="#111111" className="w-32" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" className="mr-2">
                          Preview Page
                        </Button>
                        <Button className="bg-black hover:bg-gray-800">
                          Save All Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ABOUT PAGE EDITOR */}
                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Page Editor</CardTitle>
                      <CardDescription>Edit all sections of your about page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="about-hero">
                            <AccordionTrigger><h3 className="text-base font-medium">Hero Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Page Title</label>
                                  <Input 
                                    defaultValue="About Domain Name Guide" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subtitle</label>
                                  <Input 
                                    defaultValue="Your trusted partner in domain acquisition" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-black rounded"></div>
                                    <Input defaultValue="#000000" className="w-32" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="about-mission">
                            <AccordionTrigger><h3 className="text-base font-medium">Our Mission Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Section Title</label>
                                  <Input 
                                    defaultValue="Our Mission" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Mission Statement</label>
                                  <Textarea 
                                    defaultValue="At Domain Name Guide, our mission is to connect entrepreneurs and businesses with premium domain names that enhance their brand identity and online presence. We believe that the right domain name is a cornerstone of digital success." 
                                    className="mt-1 min-h-[100px]"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="about-team">
                            <AccordionTrigger><h3 className="text-base font-medium">Our Team Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Section Title</label>
                                  <Input 
                                    defaultValue="Our Expert Team" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Section Description</label>
                                  <Textarea 
                                    defaultValue="Meet the domain experts behind Domain Name Guide. Our team brings decades of combined experience in domain acquisition, branding, and digital strategy." 
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="border rounded-md p-3 mt-3">
                                  <h4 className="text-sm font-medium mb-2">Team Member 1</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Name</label>
                                      <Input 
                                        defaultValue="John Smith" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Title</label>
                                      <Input 
                                        defaultValue="CEO & Founder" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Bio</label>
                                      <Textarea 
                                        defaultValue="John has over 15 years of experience in the domain industry and has personally brokered over $10 million in domain transactions."
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2">Team Member 2</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Name</label>
                                      <Input 
                                        defaultValue="Sarah Johnson" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Title</label>
                                      <Input 
                                        defaultValue="Domain Acquisition Specialist" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Bio</label>
                                      <Textarea 
                                        defaultValue="Sarah specializes in premium domain acquisition and has a proven track record of securing high-value domains for clients across multiple industries."
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <Button variant="outline" size="sm">
                                  <PlusIcon className="h-4 w-4 mr-2" />
                                  Add Team Member
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" className="mr-2">
                          Preview Page
                        </Button>
                        <Button className="bg-black hover:bg-gray-800">
                          Save All Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* GUIDE PAGE EDITOR */}
                <TabsContent value="guide">
                  <Card>
                    <CardHeader>
                      <CardTitle>Guide Page Editor</CardTitle>
                      <CardDescription>Edit all sections of your domain guide page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="guide-hero">
                            <AccordionTrigger><h3 className="text-base font-medium">Hero Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Page Title</label>
                                  <Input 
                                    defaultValue="Domain Name Guide" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subtitle</label>
                                  <Input 
                                    defaultValue="Everything you need to know about domains" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-black rounded"></div>
                                    <Input defaultValue="#000000" className="w-32" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="guide-content">
                            <AccordionTrigger><h3 className="text-base font-medium">Guide Content Tabs</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div className="border rounded-md p-3 mt-3">
                                  <h4 className="text-sm font-medium mb-2">Tab 1</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Tab Title</label>
                                      <Input 
                                        defaultValue="How to Choose a Domain" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Tab Content</label>
                                      <Textarea 
                                        defaultValue="Choosing the right domain name is crucial for your brand's online identity. Here are our expert tips for selecting the perfect domain name for your business."
                                        className="mt-1 min-h-[100px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2">Tab 2</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Tab Title</label>
                                      <Input 
                                        defaultValue="Domain Valuation" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Tab Content</label>
                                      <Textarea 
                                        defaultValue="Understanding domain valuation is key when buying or selling domains. Learn how domain values are determined and what factors influence a domain's worth."
                                        className="mt-1 min-h-[100px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2">Tab 3</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Tab Title</label>
                                      <Input 
                                        defaultValue="Domain Transfer Process" 
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Tab Content</label>
                                      <Textarea 
                                        defaultValue="Our comprehensive guide to the domain transfer process ensures a smooth transition when buying or selling a domain. We walk you through each step of the secure transfer process."
                                        className="mt-1 min-h-[100px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <Button variant="outline" size="sm">
                                  <PlusIcon className="h-4 w-4 mr-2" />
                                  Add New Tab
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="guide-ebook">
                            <AccordionTrigger><h3 className="text-base font-medium">Ebook Download Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Section Title</label>
                                  <Input 
                                    defaultValue="Download Our Free Ebook" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Ebook Title</label>
                                  <Input 
                                    defaultValue="Domain Name Guide: The Ultimate Resource" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea 
                                    defaultValue="Get our comprehensive guide to domain acquisition, valuation, and management. Everything you need to know about domains in one easy-to-read ebook." 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Price Display Text</label>
                                  <Input 
                                    defaultValue="Normally $49.95 - Free for a limited time" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Button Text</label>
                                  <Input 
                                    defaultValue="Download Now" 
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="require-email" defaultChecked />
                                  <label htmlFor="require-email">Require email to download</label>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" className="mr-2">
                          Preview Page
                        </Button>
                        <Button className="bg-black hover:bg-gray-800">
                          Save All Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* CONTACT PAGE EDITOR */}
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Page Editor</CardTitle>
                      <CardDescription>Edit all sections of your contact page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="contact-hero">
                            <AccordionTrigger><h3 className="text-base font-medium">Hero Section</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Page Title</label>
                                  <Input 
                                    defaultValue="Contact Us" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Subtitle</label>
                                  <Input 
                                    defaultValue="Get in touch with our domain experts" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-black rounded"></div>
                                    <Input defaultValue="#000000" className="w-32" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="contact-info">
                            <AccordionTrigger><h3 className="text-base font-medium">Contact Information</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <Input 
                                    defaultValue="contact@domainnameguide.com" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Phone</label>
                                  <Input 
                                    defaultValue="+1 (555) 123-4567" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Address</label>
                                  <Textarea 
                                    defaultValue="123 Domain Street\nSuite 456\nNew York, NY 10001" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Business Hours</label>
                                  <Textarea 
                                    defaultValue="Monday - Friday: 9:00 AM - 5:00 PM EST\nSaturday - Sunday: Closed" 
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="contact-form">
                            <AccordionTrigger><h3 className="text-base font-medium">Contact Form</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Form Title</label>
                                  <Input 
                                    defaultValue="Send Us a Message" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Form Description</label>
                                  <Textarea 
                                    defaultValue="Have a question about a domain or need assistance? Fill out the form below and our team will get back to you shortly." 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Submit Button Text</label>
                                  <Input 
                                    defaultValue="Send Message" 
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Success Message</label>
                                  <Textarea 
                                    defaultValue="Thank you for your message! We'll get back to you within 24 hours." 
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="include-phone" defaultChecked />
                                  <label htmlFor="include-phone">Include phone field</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="include-company" defaultChecked />
                                  <label htmlFor="include-company">Include company field</label>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="contact-map">
                            <AccordionTrigger><h3 className="text-base font-medium">Map Settings</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="show-map" defaultChecked />
                                  <label htmlFor="show-map">Show map on contact page</label>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Map Coordinates</label>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Input 
                                      placeholder="Latitude"
                                      defaultValue="40.7128" 
                                    />
                                    <Input 
                                      placeholder="Longitude"
                                      defaultValue="-74.0060" 
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Map Zoom Level (1-20)</label>
                                  <Input 
                                    type="number"
                                    defaultValue="14" 
                                    className="mt-1 w-24"
                                    min="1"
                                    max="20"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" className="mr-2">
                          Preview Page
                        </Button>
                        <Button className="bg-black hover:bg-gray-800">
                          Save All Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* GLOBAL ELEMENTS EDITOR */}
                <TabsContent value="global">
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Elements Editor</CardTitle>
                      <CardDescription>Edit elements that appear across all pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="global-header">
                            <AccordionTrigger><h3 className="text-base font-medium">Header & Navigation</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Site Logo Text</label>
                                  <Input 
                                    defaultValue="DOMAIN NAME GUIDE" 
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox id="use-logo-image" />
                                  <label htmlFor="use-logo-image">Use image logo instead of text</label>
                                </div>
                                
                                <div className="border rounded-md p-3 mt-3">
                                  <h4 className="text-sm font-medium mb-2">Navigation Items</h4>
                                  
                                  <div className="border-b pb-2 mb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">Premium Domains</span>
                                      <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="ghost" size="sm">↑</Button>
                                        <Button variant="ghost" size="sm">↓</Button>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">Link: /</span>
                                  </div>
                                  
                                  <div className="border-b pb-2 mb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">About</span>
                                      <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="ghost" size="sm">↑</Button>
                                        <Button variant="ghost" size="sm">↓</Button>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">Link: /about</span>
                                  </div>
                                  
                                  <div className="border-b pb-2 mb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">Guide</span>
                                      <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="ghost" size="sm">↑</Button>
                                        <Button variant="ghost" size="sm">↓</Button>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">Link: /guide</span>
                                  </div>
                                  
                                  <div className="border-b pb-2 mb-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">Contact</span>
                                      <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="ghost" size="sm">↑</Button>
                                        <Button variant="ghost" size="sm">↓</Button>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">Link: /contact</span>
                                  </div>
                                  
                                  <Button variant="outline" size="sm" className="mt-2">
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Navigation Item
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="global-footer">
                            <AccordionTrigger><h3 className="text-base font-medium">Footer</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Footer Text</label>
                                  <Textarea 
                                    defaultValue="Domain Name Guide offers premium domain names for businesses and entrepreneurs. Our curated selection includes domains in various industries and price ranges." 
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="border rounded-md p-3 mt-3">
                                  <h4 className="text-sm font-medium mb-2">Footer Links</h4>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <h5 className="text-sm font-semibold mb-2">Column 1</h5>
                                      <Input 
                                        defaultValue="Site Links" 
                                        className="mb-2"
                                        placeholder="Column Heading"
                                      />
                                      
                                      <div className="space-y-1 mb-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Home</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>About</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Guide</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Contact</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                      </div>
                                      
                                      <Button variant="outline" size="sm" className="w-full">
                                        <PlusIcon className="h-3 w-3 mr-1" />
                                        Add Link
                                      </Button>
                                    </div>
                                    
                                    <div>
                                      <h5 className="text-sm font-semibold mb-2">Column 2</h5>
                                      <Input 
                                        defaultValue="Resources" 
                                        className="mb-2"
                                        placeholder="Column Heading"
                                      />
                                      
                                      <div className="space-y-1 mb-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Domain Guide</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>FAQ</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Blog</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                      </div>
                                      
                                      <Button variant="outline" size="sm" className="w-full">
                                        <PlusIcon className="h-3 w-3 mr-1" />
                                        Add Link
                                      </Button>
                                    </div>
                                    
                                    <div>
                                      <h5 className="text-sm font-semibold mb-2">Column 3</h5>
                                      <Input 
                                        defaultValue="Legal" 
                                        className="mb-2"
                                        placeholder="Column Heading"
                                      />
                                      
                                      <div className="space-y-1 mb-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Privacy Policy</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Terms of Service</span>
                                          <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                      </div>
                                      
                                      <Button variant="outline" size="sm" className="w-full">
                                        <PlusIcon className="h-3 w-3 mr-1" />
                                        Add Link
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Copyright Text</label>
                                  <Input 
                                    defaultValue="© 2025 Domain Name Guide. All rights reserved." 
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="global-colors">
                            <AccordionTrigger><h3 className="text-base font-medium">Color Scheme</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Primary Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-black rounded"></div>
                                    <Input defaultValue="#000000" className="w-32" />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Secondary Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-white border rounded"></div>
                                    <Input defaultValue="#FFFFFF" className="w-32" />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Accent Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                                    <Input defaultValue="#10B981" className="w-32" />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Text Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-gray-900 rounded"></div>
                                    <Input defaultValue="#111827" className="w-32" />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Background Color</label>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <div className="w-6 h-6 bg-gray-50 border rounded"></div>
                                    <Input defaultValue="#F9FAFB" className="w-32" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="global-typography">
                            <AccordionTrigger><h3 className="text-base font-medium">Typography</h3></AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 p-2">
                                <div>
                                  <label className="text-sm font-medium">Heading Font</label>
                                  <Select defaultValue="Inter">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Inter">Inter</SelectItem>
                                      <SelectItem value="Roboto">Roboto</SelectItem>
                                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                                      <SelectItem value="Poppins">Poppins</SelectItem>
                                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Body Font</label>
                                  <Select defaultValue="Inter">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Inter">Inter</SelectItem>
                                      <SelectItem value="Roboto">Roboto</SelectItem>
                                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                                      <SelectItem value="Poppins">Poppins</SelectItem>
                                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Base Font Size</label>
                                  <Select defaultValue="16px">
                                    <SelectTrigger className="w-24">
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="14px">14px</SelectItem>
                                      <SelectItem value="16px">16px</SelectItem>
                                      <SelectItem value="18px">18px</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" className="mr-2">
                          Preview Site
                        </Button>
                        <Button className="bg-black hover:bg-gray-800">
                          Save All Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>

        {/* CONSULTATIONS TAB */}
        <TabsContent value="consultations" className="space-y-6">
          <h2 className="text-xl font-bold">Consultation Requests</h2>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No consultation requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell className="font-medium">{consultation.name}</TableCell>
                      <TableCell>{consultation.email}</TableCell>
                      <TableCell>{consultation.phone}</TableCell>
                      <TableCell>${consultation.budget}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(consultation.createdAt), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PAGE CONTENT TAB */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Page Content Management</h2>
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
                      metaDescription: "",
                    });
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Page Content
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingPageContent ? "Edit Page Content" : "Add New Page Content"}</DialogTitle>
                  <DialogDescription>
                    Enter the content for the page.
                  </DialogDescription>
                </DialogHeader>
                <Form {...pageContentForm}>
                  <form onSubmit={pageContentForm.handleSubmit(onPageContentSubmit)} className="space-y-4">
                    <FormField
                      control={pageContentForm.control}
                      name="pageKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Key</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for the page (e.g., "home", "about")
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
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pageContentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[120px]" />
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
                          <FormLabel>Meta Title (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Meta Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowPageContentDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPageContent ? "Update Content" : "Add Content"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No page content entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.pageKey}</TableCell>
                      <TableCell>{content.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingPageContent(content);
                              setShowPageContentDialog(true);
                            }}
                          >
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePageContent(content.pageKey)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(`/${content.pageKey}`, '_blank');
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* EMAIL SUBMISSIONS TAB */}
        <TabsContent value="emails" className="space-y-6">
          <h2 className="text-xl font-bold">Email Submissions</h2>
          <EmailSubmissionsTable />
        </TabsContent>

        {/* BACKUP/RESTORE TAB */}
        <TabsContent value="backup" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Data Synchronization & Backup</h2>
          </div>
          
          <BackupRestore />
        </TabsContent>
        
        {/* EBOOKS TAB */}
        <TabsContent value="ebooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ebook File Management</h2>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload New Ebook
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Domain Name Guide.pdf</CardTitle>
                <CardDescription>Main guide ebook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>PDF • 4.2MB</span>
                </div>
              </CardContent>
              <div className="p-4 pt-0 flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            
            <Card className="border-dashed border-2 flex flex-col justify-center items-center p-6">
              <div className="text-center">
                <PlusIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium">Upload New Ebook</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop a PDF file or click to browse
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                Upload File
              </Button>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Capture Statistics</CardTitle>
                <CardDescription>Track engagement with your ebook marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Downloads</span>
                    <span className="text-2xl font-bold">128</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">This Month</span>
                    <span className="text-2xl font-bold">42</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                    <span className="text-2xl font-bold">6.8%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Avg. Time on Page</span>
                    <span className="text-2xl font-bold">2:34</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO SETTINGS TAB */}
        <TabsContent value="seo" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">SEO Settings</h2>
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
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add SEO Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingSeoSettings ? "Edit SEO Settings" : "Add New SEO Settings"}</DialogTitle>
                  <DialogDescription>
                    Enter the SEO settings for the page.
                  </DialogDescription>
                </DialogHeader>
                <Form {...seoSettingsForm}>
                  <form onSubmit={seoSettingsForm.handleSubmit(onSeoSettingsSubmit)} className="space-y-4">
                    <FormField
                      control={seoSettingsForm.control}
                      name="pageKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Key</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for the page (e.g., "home", "about")
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
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={seoSettingsForm.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={seoSettingsForm.control}
                      name="structuredData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Structured Data (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[120px]" placeholder='{"@context": "https://schema.org", ...}' />
                          </FormControl>
                          <FormDescription>
                            JSON-LD structured data
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowSeoSettingsDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingSeoSettings ? "Update SEO Settings" : "Add SEO Settings"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seoSettings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No SEO settings entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  seoSettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.pageKey}</TableCell>
                      <TableCell>{setting.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingSeoSettings(setting);
                              setShowSeoSettingsDialog(true);
                            }}
                          >
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSeoSettings(setting.pageKey)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(`/${setting.pageKey}`, '_blank');
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}