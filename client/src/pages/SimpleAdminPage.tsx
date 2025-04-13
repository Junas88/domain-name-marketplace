import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, Loader2, Plus, Pencil, Trash, Check, Tag, 
  CircleCheck, Upload, Search, Download, File, Save,
  AlertTriangle, Eye, X, FileText, ExternalLink
} from "lucide-react";
import { 
  Domain, PageContent, SeoSettings, Consultation, 
  EmailSubmission, Offer, InsertDomain, InsertPageContent,
  InsertSeoSettings
} from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SimpleAdminPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("domains");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  
  // States for dialogs and editing
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [dialogTitle, setDialogTitle] = useState("Edit Content");
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<SeoSettings | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: string} | null>(null);
  const [csvData, setCsvData] = useState("");
  
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
  const { data: domains = [], refetch: refetchDomains } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: isAdmin,
  });
  
  // Page content query
  const { data: pageContents = [], refetch: refetchContents } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
    enabled: isAdmin,
  });
  
  // SEO settings query
  const { data: seoSettings = [], refetch: refetchSeo } = useQuery<SeoSettings[]>({
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
  
  // Offers query
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
    enabled: isAdmin,
  });
  
  // Domain form schema
  const domainFormSchema = z.object({
    name: z.string().min(3, "Domain name must be at least 3 characters"),
    description: z.string().min(10, "Description is required"),
    price: z.coerce.number().min(1, "Price is required"),
    category: z.string().min(1, "Category is required"),
    length: z.coerce.number().min(1, "Length is required"),
    isSold: z.boolean().default(false),
  });
  
  // Page content form schema
  const contentFormSchema = z.object({
    pageKey: z.string().min(1, "Page key is required"),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  });
  
  // SEO settings form schema
  const seoFormSchema = z.object({
    pageKey: z.string().min(1, "Page key is required"),
    title: z.string().min(1, "Title is required"),
    metaDescription: z.string().min(1, "Meta description is required"),
    metaKeywords: z.string().min(1, "Meta keywords are required"),
  });
  
  // Domain form
  const domainForm = useForm<z.infer<typeof domainFormSchema>>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      length: 0,
      isSold: false,
    },
  });
  
  // Content form
  const contentForm = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      pageKey: "",
      title: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
    },
  });
  
  // SEO form
  const seoForm = useForm<z.infer<typeof seoFormSchema>>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      pageKey: "",
      title: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });
  
  // Domain mutations
  const createDomainMutation = useMutation({
    mutationFn: async (data: InsertDomain) => {
      const res = await apiRequest("POST", "/api/admin/domains", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain created successfully",
      });
      setDomainDialogOpen(false);
      domainForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      refetchDomains();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateDomainMutation = useMutation({
    mutationFn: async (data: Domain) => {
      const res = await apiRequest("PATCH", `/api/admin/domains/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain updated successfully",
      });
      setDomainDialogOpen(false);
      domainForm.reset();
      setEditingDomain(null);
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      refetchDomains();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteDomainMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/domains/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });
      setConfirmDeleteDialogOpen(false);
      setItemToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      refetchDomains();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete domain: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const markAsSoldMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/domains/${id}/mark-sold`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain marked as sold",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      refetchDomains();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to mark domain as sold: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Content mutations
  const updateContentMutation = useMutation({
    mutationFn: async (data: { pageKey: string, content: Partial<InsertPageContent> }) => {
      const res = await apiRequest("PATCH", `/api/admin/page-contents/${data.pageKey}`, data.content);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
      setContentDialogOpen(false);
      contentForm.reset();
      setEditingContent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      refetchContents();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update content: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // SEO mutations
  const updateSeoMutation = useMutation({
    mutationFn: async (data: { pageKey: string, seo: Partial<InsertSeoSettings> }) => {
      const res = await apiRequest("PATCH", `/api/admin/seo-settings/${data.pageKey}`, data.seo);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SEO settings updated successfully",
      });
      setSeoDialogOpen(false);
      seoForm.reset();
      setEditingSeo(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      refetchSeo();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update SEO settings: ${error.message}`,
        variant: "destructive",
      });
    },
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
    
  // Function to ensure all necessary page content entries exist
  const ensurePageContents = () => {
    // Define all required page content sections by key and default title
    const requiredPages = [
      { key: 'home', title: 'Home Page' },
      { key: 'home-hero', title: 'Home Hero Section' },
      { key: 'home-benefits', title: 'Why Choose Domain Name Guide' },
      { key: 'home-recently-sold', title: 'Recently Sold Domains Section' },
      { key: 'about', title: 'About Us' },
      { key: 'buyer-protection', title: 'Buyer Protection' },
      { key: 'contact', title: 'Contact Us' },
      { key: 'domain-valuation', title: 'Domain Valuation' },
      { key: 'faqs', title: 'Frequently Asked Questions' },
      { key: 'guide', title: 'Domain Guide' },
      { key: 'guide-ebook', title: 'Domain Name Guide Ebook' },
      { key: 'how-it-works', title: 'How It Works' },
      { key: 'selling-strategy', title: 'Selling Strategy' },
      { key: 'terms', title: 'Terms of Service' },
      { key: 'privacy-policy', title: 'Privacy Policy' },
      { key: 'not-found', title: 'Page Not Found' },
      { key: 'footer', title: 'Footer Content' },
      { key: 'header', title: 'Header Content' },
    ];
    
    // Identify missing pages
    const existingKeys = pageContents.map(content => content.pageKey);
    const missingPages = requiredPages.filter(page => !existingKeys.includes(page.key));
    
    // Add missing pages
    missingPages.forEach(page => {
      handleEditContent(page.key, page.title);
    });
    
    // If there are missing pages, show a notification
    if (missingPages.length > 0) {
      toast({
        title: `${missingPages.length} missing page sections found`,
        description: "You can now edit all website sections from the Content Management system",
      });
    }
  };
  
  // Domain Form Submit
  const onDomainSubmit = (values: z.infer<typeof domainFormSchema>) => {
    if (editingDomain) {
      updateDomainMutation.mutate({
        ...editingDomain,
        ...values,
      });
    } else {
      createDomainMutation.mutate(values);
    }
  };
  
  // Content Form Submit
  const onContentSubmit = (values: z.infer<typeof contentFormSchema>) => {
    if (editingContent) {
      // Update existing content
      updateContentMutation.mutate({
        pageKey: editingContent.pageKey,
        content: values,
      });
    } else {
      // Create new content
      createContentMutation.mutate(values);
    }
  };
  
  // SEO Form Submit
  const onSeoSubmit = (values: z.infer<typeof seoFormSchema>) => {
    if (editingSeo) {
      updateSeoMutation.mutate({
        pageKey: editingSeo.pageKey,
        seo: values,
      });
    }
  };
  
  // Handle editing domain
  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    domainForm.reset({
      name: domain.name,
      description: domain.description,
      price: domain.price,
      category: domain.category,
      length: domain.length,
      isSold: domain.isSold,
    });
    setDomainDialogOpen(true);
  };
  
  // Create page content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: InsertPageContent) => {
      const res = await apiRequest("POST", "/api/admin/page-contents", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content created successfully",
      });
      setContentDialogOpen(false);
      contentForm.reset();
      setEditingContent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      refetchContents();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle editing content - with create functionality if content doesn't exist
  const handleEditContent = (pageKey: string, defaultTitle: string = "") => {
    // Find existing content or prepare to create new content
    const content = pageContents.find(c => c.pageKey === pageKey);
    
    if (content) {
      // Edit existing content
      setEditingContent(content);
      setDialogTitle(`Edit ${content.title || defaultTitle}`);
      contentForm.reset({
        pageKey: content.pageKey,
        title: content.title || defaultTitle,
        content: content.content || "",
        metaTitle: content.metaTitle || "",
        metaDescription: content.metaDescription || "",
      });
    } else {
      // Prepare for new content creation
      setEditingContent(null);
      setDialogTitle(`Add ${defaultTitle}`);
      contentForm.reset({
        pageKey: pageKey,
        title: defaultTitle,
        content: "",
        metaTitle: "",
        metaDescription: "",
      });
    }
    
    setContentDialogOpen(true);
  };
  
  // Handle editing SEO
  const handleEditSeo = (seo: SeoSettings) => {
    setEditingSeo(seo);
    seoForm.reset({
      pageKey: seo.pageKey,
      title: seo.title,
      metaDescription: seo.metaDescription,
      metaKeywords: seo.metaKeywords,
    });
    setSeoDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (id: number, type: string) => {
    setItemToDelete({ id, type });
    setConfirmDeleteDialogOpen(true);
  };
  
  // Execute delete
  const executeDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'domain') {
      deleteDomainMutation.mutate(itemToDelete.id);
    }
    // Can add other delete types here in the future
  };
  
  // Export email submissions to CSV
  const exportEmailsToCSV = () => {
    if (emailSubmissions.length === 0) {
      toast({
        title: "No data",
        description: "There are no email submissions to export",
        variant: "destructive",
      });
      return;
    }
    
    const headers = ["Email", "Source", "Date"];
    const csvRows = [
      headers.join(","),
      ...emailSubmissions.map(sub => {
        return [
          sub.email,
          sub.source,
          new Date(sub.downloadedAt).toLocaleDateString()
        ].join(",");
      })
    ];
    
    const csvString = csvRows.join("\n");
    setCsvData(csvString);
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'email_submissions.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export complete",
      description: "Email submissions have been exported to CSV",
    });
  };
  
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="ebooks">Ebook Files</TabsTrigger>
        </TabsList>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Domain Management</h2>
            <Button onClick={() => {
              setEditingDomain(null);
              domainForm.reset({
                name: "",
                description: "",
                price: 0,
                category: "",
                length: 0,
                isSold: false,
              });
              setDomainDialogOpen(true);
            }}>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditDomain(domain)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteConfirm(domain.id, 'domain')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        {!domain.isSold && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsSoldMutation.mutate(domain.id)}
                          >
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
          
          {/* Domain Edit/Add Dialog */}
          <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
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
                          <Input placeholder="example.com" {...field} />
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
                          <Textarea
                            placeholder="A great domain for..."
                            {...field}
                            rows={3}
                          />
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
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1999"
                              {...field}
                            />
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
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                            />
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
                  {editingDomain && (
                    <FormField
                      control={domainForm.control}
                      name="isSold"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Mark as sold</FormLabel>
                            <FormDescription>
                              This domain will be displayed as sold and unavailable for purchase.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  <DialogFooter>
                    <Button type="submit">
                      {editingDomain ? "Update Domain" : "Add Domain"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">
                      {domains.find(d => d.id === offer.domainId)?.name || `Domain #${offer.domainId}`}
                    </TableCell>
                    <TableCell>${offer.amount.toLocaleString()}</TableCell>
                    <TableCell>{offer.name}</TableCell>
                    <TableCell>{offer.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">New</Badge>
                    </TableCell>
                    <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Industry</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell className="font-medium">{consultation.name}</TableCell>
                    <TableCell>{consultation.email}</TableCell>
                    <TableCell>{consultation.industry}</TableCell>
                    <TableCell>{consultation.budget}</TableCell>
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
        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Page Content Management</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => ensurePageContents()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Add All Missing Pages
              </Button>
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => {
                  contentForm.reset({
                    pageKey: "",
                    title: "",
                    content: "",
                    metaTitle: "",
                    metaDescription: "",
                  });
                  setEditingContent(null);
                  setDialogTitle("Add New Content");
                  setContentDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Content
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pageContents.map((content) => (
              <div 
                key={content.id} 
                className="group relative rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden"
              >
                {/* Content preview header */}
                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3 text-gray-500" />
                    <h3 className="font-medium text-xs truncate max-w-[120px]">{content.title || content.pageKey}</h3>
                  </div>
                  <Badge variant="outline" className="bg-white text-[10px] px-1 py-0 h-5">
                    {content.pageKey}
                  </Badge>
                </div>
                
                {/* Content preview */}
                <div className="p-3 h-20 overflow-hidden relative">
                  <div className="prose prose-sm">
                    <div 
                      className="line-clamp-3 text-xs text-gray-600"
                      dangerouslySetInnerHTML={{ __html: content.content || '<p class="text-gray-400 italic">No content</p>' }} 
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                
                {/* Footer with metadata and actions */}
                <div className="p-2 bg-white border-t flex justify-between items-center">
                  <div className="text-[10px] text-gray-500">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`/${content.pageKey}`, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditContent(content.pageKey, content.title || 'Page Content')}
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </div>
                
                {/* Hover overlay with quick edit action */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-white text-black hover:bg-gray-100 h-7 text-xs px-2"
                    onClick={() => handleEditContent(content.pageKey, content.title || 'Page Content')}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            
            {pageContents.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-10 text-center">
                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No page content yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new page content.</p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      contentForm.reset({
                        pageKey: "",
                        title: "",
                        content: "",
                        metaTitle: "",
                        metaDescription: "",
                      });
                      setEditingContent(null);
                      setDialogTitle("Add New Content");
                      setContentDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Page Content Edit Dialog */}
          <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
              <DialogHeader className="px-4 pt-4 pb-2 border-b">
                <DialogTitle className="text-lg font-bold">{dialogTitle}</DialogTitle>
                <DialogDescription className="text-xs">
                  Edit content and SEO for this page
                </DialogDescription>
              </DialogHeader>
              <Form {...contentForm}>
                <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-3">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <FormField
                          control={contentForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium">Page Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-8 text-sm border-gray-200 focus:border-black focus:ring-black" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          control={contentForm.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs font-medium">Meta Title (SEO)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-8 text-sm border-gray-200 focus:border-black focus:ring-black" 
                                  placeholder="Leave empty to use page title" 
                                />
                              </FormControl>
                              <FormDescription className="text-[10px]">
                                Leave empty to use page title
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={contentForm.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-medium">Meta Description (SEO)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={2} 
                              className="text-sm min-h-[60px] border-gray-200 focus:border-black focus:ring-black resize-none" 
                              placeholder="Brief description for search engines" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full">
                    <div className="px-4 mb-1">
                      <h3 className="font-medium text-xs mb-1">Editor Tools</h3>
                      <div className="flex flex-wrap gap-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="h-6 px-2 text-xs bg-white border-gray-200 hover:bg-gray-50"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<h2>${selectedText}</h2>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          H2
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<h3>${selectedText}</h3>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          H3
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<p>${selectedText}</p>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Paragraph
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<strong>${selectedText}</strong>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Bold
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<em>${selectedText}</em>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Italic
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<a href="#">${selectedText}</a>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Link
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<ul>\n  <li>${selectedText || 'List item'}</li>\n  <li>List item</li>\n</ul>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          List
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const selectedText = text.substring(start, end);
                              const replacement = `<div class="bg-gray-100 p-4 rounded-md shadow-sm my-4">\n  ${selectedText || 'Content box'}\n</div>`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Box
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const replacement = `<img src="/placeholder-image.jpg" alt="Description" class="rounded-md my-4 w-full" />`;
                              contentForm.setValue('content', 
                                text.substring(0, start) + replacement + text.substring(end),
                                { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        >
                          Image
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-b">
                      <FormField
                        control={contentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormLabel className="sr-only">Content</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                id="content-textarea"
                                rows={6}
                                className="font-mono text-xs resize-none border-0 focus:ring-0 rounded-none min-h-[150px]"
                                placeholder="HTML content for the page. Use the editor tools above to format your content."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="px-6 py-2 text-xs text-gray-500">
                        HTML content for the page. Use the editor tools above to format your content.
                      </div>
                    </div>
                      
                    <div className="px-4 my-2">
                      <div className="flex items-center mb-1">
                        <Eye className="h-3 w-3 mr-1" />
                        <h3 className="font-medium text-xs">Preview</h3>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none bg-gray-50 p-3 rounded-md border border-gray-200 overflow-auto max-h-[120px]"
                        dangerouslySetInnerHTML={{ __html: contentForm.watch('content') || '<p class="text-gray-400 italic text-xs">No content to preview</p>' }}
                      />
                    </div>
                  </div>
                  <DialogFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between sm:justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editingContent) {
                            contentForm.reset({
                              pageKey: editingContent.pageKey,
                              title: editingContent.title || "",
                              content: editingContent.content || "",
                              metaTitle: editingContent.metaTitle || "",
                              metaDescription: editingContent.metaDescription || "",
                            });
                          } else {
                            contentForm.reset({
                              pageKey: contentForm.getValues("pageKey"),
                              title: "",
                              content: "",
                              metaTitle: "",
                              metaDescription: "",
                            });
                          }
                        }}
                        className="h-7 text-xs border-gray-200"
                      >
                        Reset
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editingContent) {
                            window.open(`/${editingContent.pageKey}`, '_blank');
                          }
                        }}
                        disabled={!editingContent}
                        className="h-7 text-xs border-gray-200"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                    <Button type="submit" className="h-7 text-xs bg-black hover:bg-gray-800 text-white">
                      {editingContent ? 'Save Changes' : 'Create Content'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* WEBSITE EDITOR TAB */}
        <TabsContent value="website" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Website Editor</h2>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Site
              </Button>
              <Button variant="default" className="bg-black hover:bg-gray-800 text-white">
                <Save className="h-4 w-4 mr-2" />
                Publish Changes
              </Button>
            </div>
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
                <CardContent className="space-y-6">
                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Status indicator */}
                    <div className="absolute right-3 top-3 z-10 flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-gray-500">Active</span>
                    </div>
                    
                    {/* Section number badge - floating left */}
                    <div className="absolute left-0 top-4 bg-black px-2 py-1 text-xs font-semibold text-white shadow-md">
                      Section 1
                    </div>
                    
                    {/* Content preview */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
                      <div className="h-full w-full p-8 pt-12">
                        <h4 className="text-lg font-bold">
                          {pageContents.find(c => c.pageKey === 'home-hero')?.title || "Premium Domain Names For Your Business"}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {pageContents.find(c => c.pageKey === 'home-hero')?.content?.replace(/<[^>]*>/g, ' ').substring(0, 100) || "Main banner with headline, subheading, and call-to-action button"}...
                        </p>
                      </div>
                      
                      {/* Hover overlay with quick actions */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={() => {
                            handleEditContent('home-hero', 'Premium Domain Names For Your Business');
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Content
                        </Button>
                      </div>
                    </div>
                    
                    {/* Footer with metadata */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Hero Section</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-gray-50">Hero</Badge>
                          <Badge variant="outline" className="bg-gray-50">Primary</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(pageContents.find(c => c.pageKey === 'home-hero')?.updatedAt || Date.now()).toLocaleDateString()}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open('/', '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Status indicator */}
                    <div className="absolute right-3 top-3 z-10 flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-gray-500">Dynamic</span>
                    </div>
                    
                    {/* Section number badge - floating left */}
                    <div className="absolute left-0 top-4 bg-black px-2 py-1 text-xs font-semibold text-white shadow-md">
                      Section 2
                    </div>
                    
                    {/* Content preview */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
                      <div className="h-full w-full p-8 pt-12">
                        <h4 className="text-lg font-bold">Featured Domains</h4>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {domains.filter(d => !d.isSold).slice(0, 3).map(d => d.name).join(", ")} and {Math.min(20, domains.filter(d => !d.isSold).length - 3)} more...
                        </p>
                      </div>
                      
                      {/* Hover overlay with quick actions */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={() => setActiveTab("domains")}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Manage Domains
                        </Button>
                      </div>
                    </div>
                    
                    {/* Footer with metadata */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Featured Domains</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-gray-50">Product</Badge>
                          <Badge variant="outline" className="bg-gray-50">Dynamic</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {domains.filter(d => !d.isSold).length} domains available
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open('/', '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Status indicator */}
                    <div className="absolute right-3 top-3 z-10 flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-gray-500">Active</span>
                    </div>
                    
                    {/* Section number badge - floating left */}
                    <div className="absolute left-0 top-4 bg-black px-2 py-1 text-xs font-semibold text-white shadow-md">
                      Section 3
                    </div>
                    
                    {/* Content preview */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
                      <div className="h-full w-full p-8 pt-12">
                        <h4 className="text-lg font-bold">
                          {pageContents.find(c => c.pageKey === 'home-benefits')?.title || "Why Choose Domain Name Guide"}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {pageContents.find(c => c.pageKey === 'home-benefits')?.content?.replace(/<[^>]*>/g, ' ').substring(0, 100) || "Value proposition and key benefits of using our marketplace"}...
                        </p>
                      </div>
                      
                      {/* Hover overlay with quick actions */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={() => {
                            handleEditContent('home-benefits', 'Why Choose Domain Name Guide');
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Content
                        </Button>
                      </div>
                    </div>
                    
                    {/* Footer with metadata */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Benefits Section</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-gray-50">Features</Badge>
                          <Badge variant="outline" className="bg-gray-50">Secondary</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(pageContents.find(c => c.pageKey === 'home-benefits')?.updatedAt || Date.now()).toLocaleDateString()}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open('/#benefits', '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Status indicator */}
                    <div className="absolute right-3 top-3 z-10 flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-gray-500">Dynamic</span>
                    </div>
                    
                    {/* Section number badge - floating left */}
                    <div className="absolute left-0 top-4 bg-black px-2 py-1 text-xs font-semibold text-white shadow-md">
                      Section 4
                    </div>
                    
                    {/* Content preview */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
                      <div className="h-full w-full p-8 pt-12">
                        <h4 className="text-lg font-bold">
                          {pageContents.find(c => c.pageKey === 'home-recently-sold')?.title || "Gone Fast - See What's Already Sold"}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {domains.filter(d => d.isSold).slice(0, 3).map(d => d.name).join(", ")} and {Math.max(0, domains.filter(d => d.isSold).length - 3)} more...
                        </p>
                      </div>
                      
                      {/* Hover overlay with quick actions */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={() => {
                            handleEditContent('home-recently-sold', 'Gone Fast - See What\'s Already Sold');
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Content
                        </Button>
                      </div>
                    </div>
                    
                    {/* Footer with metadata */}
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Recently Sold Domains</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-gray-50">Social Proof</Badge>
                          <Badge variant="outline" className="bg-gray-50">Dynamic</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {domains.filter(d => d.isSold).length} domains sold
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open('/#sold', '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Section
                  </Button>
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
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Section 1</span>
                          Guide Header
                        </h3>
                        <p className="text-sm text-gray-500">
                          Introduction and overview of domain guide resources
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('guide', 'Domain Guide: Everything You Need to Know');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                      <div className="font-bold">Current content:</div>
                      <div className="text-gray-600 mt-1 line-clamp-2">
                        {pageContents.find(c => c.pageKey === 'guide')?.title || "Domain Guide: Everything You Need to Know"}
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Educational</Badge>
                        <Badge variant="outline">Primary</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(pageContents.find(c => c.pageKey === 'guide')?.updatedAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Section 2</span>
                          Free Ebook Download
                        </h3>
                        <p className="text-sm text-gray-500">
                          Lead generation section with free domain guide PDF
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('guide-ebook', 'Domain Name Guide - Free Ebook');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                      <div className="font-bold">Current status:</div>
                      <div className="text-gray-600 mt-1">
                        {emailSubmissions.length} downloads collected
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">CTA</Badge>
                        <Badge variant="outline">Lead Gen</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Conversion rate: {(emailSubmissions.length / totalViews * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Section
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
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Section 1</span>
                          Company Story
                        </h3>
                        <p className="text-sm text-gray-500">
                          Main content about your company's mission and history
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('about', 'About Domain Name Guide');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                      <div className="font-bold">Current content:</div>
                      <div className="text-gray-600 mt-1 line-clamp-2">
                        {pageContents.find(c => c.pageKey === 'about')?.title || "About Domain Name Guide"}
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Section
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
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Section 1</span>
                          Contact Information
                        </h3>
                        <p className="text-sm text-gray-500">
                          Company contact details and inquiry form
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('contact', 'Get in Touch');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                      <div className="font-bold">Current content:</div>
                      <div className="text-gray-600 mt-1 line-clamp-2">
                        {pageContents.find(c => c.pageKey === 'contact')?.title || "Get in Touch"}
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Section
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
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Global</span>
                          Header Navigation
                        </h3>
                        <p className="text-sm text-gray-500">
                          Main menu links and site logo appearance
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('global-header', 'Site Navigation');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm border-l-2 border-black pl-4">
                      <div className="font-bold">Current navigation:</div>
                      <div className="text-gray-600 mt-1 flex space-x-4">
                        <span>Home</span>
                        <span>Guide</span>
                        <span>About</span>
                        <span>Contact</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Global</span>
                          Footer Content
                        </h3>
                        <p className="text-sm text-gray-500">
                          Footer links, copyright text, and legal information
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('global-footer', 'Footer Content');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm border-l-2 border-black pl-4">
                      <div className="font-bold">Current footer:</div>
                      <div className="text-gray-600 mt-1">
                        Copyright © {new Date().getFullYear()} Domain Name Guide. All rights reserved.
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="bg-black text-white rounded px-2 py-1 text-xs mr-2">Global</span>
                          Theme & Brand Settings
                        </h3>
                        <p className="text-sm text-gray-500">
                          Colors, typography, and site-wide design elements
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditContent('global-theme', 'Theme & Brand Settings');
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <div className="w-8 h-8 rounded-full bg-black"></div>
                      <div className="w-8 h-8 rounded-full bg-white border"></div>
                      <div className="w-8 h-8 rounded-full bg-green-500"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="text-xs mt-2 text-gray-500">
                      Primary color palette
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
            <Button variant="outline" onClick={exportEmailsToCSV}>
              <Download className="h-4 w-4 mr-2" />
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
                    <TableCell>{new Date(submission.downloadedAt).toLocaleDateString()}</TableCell>
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
                    <TableCell className="max-w-xs truncate">{setting.metaDescription}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSeo(setting)}
                      >
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
          
          {/* SEO Settings Edit Dialog */}
          <Dialog open={seoDialogOpen} onOpenChange={setSeoDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit SEO Settings</DialogTitle>
                <DialogDescription>
                  Update SEO information for this page.
                </DialogDescription>
              </DialogHeader>
              <Form {...seoForm}>
                <form onSubmit={seoForm.handleSubmit(onSeoSubmit)} className="space-y-4">
                  <FormField
                    control={seoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This appears in search results and browser tabs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seoForm.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Appears in search results. Keep it under 160 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seoForm.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="domain, marketplace, investment" />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords relevant to the page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">
                      Update SEO Settings
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                    <p className="text-sm mt-1">Downloads: {emailSubmissions.length}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will permanently delete the item from the database.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}