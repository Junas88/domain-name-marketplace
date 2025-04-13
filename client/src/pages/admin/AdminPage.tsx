import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, ExternalLink } from "lucide-react";
import EmailSubmissionsTable from "@/components/admin/EmailSubmissionsTable";
import { Domain, PageContent, SeoSettings, Consultation } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  EyeIcon,
  FileText,
  LogOut,
  PenIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";


const pageContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  styles: z.string().optional(),
});

type PageContentValues = z.infer<typeof pageContentSchema>;

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
  const { user, isLoading, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("domains");
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [showPageContentDialog, setShowPageContentDialog] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState<PageContent | null>(null);
  const [showSeoSettingsDialog, setShowSeoSettingsDialog] = useState(false);
  const [editingSeoSettings, setEditingSeoSettings] = useState<SeoSettings | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PageContentValues>({
    resolver: zodResolver(pageContentSchema),
    defaultValues: {
      title: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      styles: "",
    },
  });

  // Fetch page content
  const { data: pageContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ["pageContent", currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/admin/page-contents/${currentPage}`);
      if (!res.ok) throw new Error("Failed to fetch page content");
      return res.json();
    },
    enabled: !!currentPage,
  });

  // Update form when page content changes
  useEffect(() => {
    if (pageContent) {
      form.reset({
        title: pageContent.title || "",
        content: pageContent.content || "",
        metaTitle: pageContent.metaTitle || "",
        metaDescription: pageContent.metaDescription || "",
        styles: pageContent.styles || "",
      });
    }
  }, [pageContent, form]);

  // Update page content mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: PageContentValues) => {
      const res = await fetch(`/api/admin/page-contents/${currentPage}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update page content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pageContent"]);
      toast({
        title: "Page Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PageContentValues) => {
    updatePageMutation.mutate(data);
  };

  // ...rest of the original code (domains, consultations, etc.)...
  const [isRedirecting, setIsRedirecting] = useState(false);
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
  };

  // Fetch data - all queries must be before any conditional returns
  // and all enabled by admin check
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
    enabled: !!user?.isAdmin,
  });

  const { data: stats = {
    totalDomains: 0,
    soldDomains: 0,
    totalViews: 0,
    domainsByCategory: {},
    totalRevenue: 0,
    averagePrice: 0
  }
  } = useQuery<DomainStats>({
    queryKey: ["/api/admin/domains/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ["/api/admin/consultations"],
    enabled: !!user?.isAdmin,
  });

  const { data: pageContents = [] } = useQuery<PageContent[]>({
    queryKey: ["/api/admin/page-contents"],
    enabled: !!user?.isAdmin,
  });

  const { data: seoSettings = [] } = useQuery<SeoSettings[]>({
    queryKey: ["/api/admin/seo-settings"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/domains/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/domains/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/domains/stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/domains/stats"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-contents"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-contents"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-contents"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
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
                window.location.href = "/";
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


      <Tabs defaultValue="domains" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="site">Website Editor</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="ebooks">Ebook Files</TabsTrigger>
        </TabsList>

        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Domain Management</h2>
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
                {domains.map((domain) => (
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Website Editor</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open("/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Site
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Pages</CardTitle>
                  <CardDescription>Select a page to edit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    orientation="vertical"
                    value={currentPage}
                    onValueChange={setCurrentPage}
                    className="w-full"
                  >
                    <TabsList className="flex flex-col w-full">
                      <TabsTrigger value="home">Home Page</TabsTrigger>
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="guide">Guide</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="faq">FAQ</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Edit {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page</CardTitle>
                  <CardDescription>Make changes to your page content</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingContent ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Page Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[400px] font-mono"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meta Title</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meta Description</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="styles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom CSS</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[200px] font-mono"
                                  placeholder=".custom-class { color: #000; }"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
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
                              window.open(`/${content.pageKey}`, "_blank");
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
                              window.open(`/${setting.pageKey}`, "_blank");
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