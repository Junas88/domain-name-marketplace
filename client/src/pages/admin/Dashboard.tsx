import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Check,
  LogOut,
  PenIcon,
  PlusIcon,
  RefreshCw,
  TagIcon,
  TrashIcon
} from "lucide-react";
import { Domain, Offer, Consultation, PageContent } from "@/lib/types";
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

type PageContentFormValues = z.infer<typeof pageContentFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("domains");
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<null | any>(null);
  const [showPageContentDialog, setShowPageContentDialog] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState<null | PageContent>(null);
  const { toast } = useToast();
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Fetch all domains
  const { data: domains = [], isLoading: isLoadingDomains, refetch: refetchDomains } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
  });

  // Type for domain stats
  interface DomainStats {
    totalDomains: number;
    soldDomains: number;
    totalViews: number;
    domainsByCategory: Record<string, number>;
  }

  // Fetch domain stats
  const { data: stats = { totalDomains: 0, soldDomains: 0, totalViews: 0, domainsByCategory: {} }, isLoading: isLoadingStats } = useQuery<DomainStats>({
    queryKey: ['/api/admin/domains/stats'],
  });

  // Interface for offer with domain name included
  interface OfferWithDomain extends Offer {
    domainName: string;
  }

  // Fetch all offers
  const { data: offers = [], isLoading: isLoadingOffers } = useQuery<OfferWithDomain[]>({
    queryKey: ['/api/admin/offers'],
  });

  // Fetch all consultations
  const { data: consultations = [], isLoading: isLoadingConsultations } = useQuery<Consultation[]>({
    queryKey: ['/api/admin/consultations'],
  });
  
  // Fetch all page content
  const { data: pageContents = [], isLoading: isLoadingPageContents, refetch: refetchPageContents } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
  });

  // Form for adding/editing page content
  const pageContentForm = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentFormSchema),
    defaultValues: editingPageContent || {
      pageKey: "",
      title: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
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
                navigate('/admin/login');
              }
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <Tabs defaultValue="domains" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
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
      </Tabs>
    </div>
  );
}