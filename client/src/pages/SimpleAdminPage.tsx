import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PlusIcon, Pencil, Trash, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Domain, PageContent } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schemas
const pageContentFormSchema = z.object({
  pageKey: z.string().min(1, "Page key is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const domainFormSchema = z.object({
  name: z.string().min(3, "Domain name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  length: z.coerce.number().min(3, "Length must be at least 3 characters"),
});

// Form types
type PageContentFormValues = z.infer<typeof pageContentFormSchema>;
type DomainFormValues = z.infer<typeof domainFormSchema>;

export default function SimpleAdminPage() {
  const [activeTab, setActiveTab] = useState("domains");
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editingPageContent, setEditingPageContent] = useState<PageContent | null>(null);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showDomainForm, setShowDomainForm] = useState(false);
  
  const { toast } = useToast();
  const { user, isLoading, logoutMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Not authenticated as admin, redirecting to home page");
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
      setIsRedirecting(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, isLoading, toast]);
  
  // Fetch domains
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: !!user?.isAdmin,
  });
  
  // Fetch page contents
  const { data: pageContents = [] } = useQuery<PageContent[]>({
    queryKey: ['/api/admin/page-contents'],
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
  
  // Update forms when editing
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
  
  // Mutations for domains
  const addDomainMutation = useMutation({
    mutationFn: async (data: DomainFormValues) => {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to add domain");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setShowDomainForm(false);
      domainForm.reset();
      toast({
        title: "Domain Added",
        description: "The domain has been added successfully",
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
      const res = await fetch(`/api/admin/domains/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.domain),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update domain");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      setShowDomainForm(false);
      setEditingDomain(null);
      domainForm.reset();
      toast({
        title: "Domain Updated",
        description: "The domain has been updated successfully",
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
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete domain");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: "Domain Deleted",
        description: "The domain has been deleted successfully",
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
  
  // Mutations for page content
  const addPageContentMutation = useMutation({
    mutationFn: async (data: PageContentFormValues) => {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to add page content");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      setShowContentForm(false);
      pageContentForm.reset();
      toast({
        title: "Page Content Added",
        description: "The page content has been added successfully",
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
      const res = await fetch(`/api/admin/page-contents/${data.pageKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.content),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update page content");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      setShowContentForm(false);
      setEditingPageContent(null);
      pageContentForm.reset();
      toast({
        title: "Page Content Updated",
        description: "The page content has been updated successfully",
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
      const res = await fetch(`/api/admin/page-contents/${pageKey}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete page content");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      toast({
        title: "Page Content Deleted",
        description: "The page content has been deleted successfully",
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
  
  // Event handlers
  const handleDeleteDomain = (id: number) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      deleteDomainMutation.mutate(id);
    }
  };
  
  const handleDeletePageContent = (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete this page content?")) {
      deletePageContentMutation.mutate(pageKey);
    }
  };
  
  // Show loading state
  if (isLoading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="text-lg font-medium">
          {isRedirecting ? "Redirecting..." : "Loading dashboard..."}
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
          <h1 className="text-3xl font-bold text-black">Simple Admin Dashboard</h1>
          <p className="text-gray-600">Manage your website content and domains</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0 border-black" 
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                toast({
                  title: "Logged out successfully",
                  description: "You have been logged out of the admin dashboard",
                });
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              }
            });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>
      
      <Tabs defaultValue="domains" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
        </TabsList>
        
        {/* DOMAINS TAB */}
        <TabsContent value="domains" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Domain Management</h2>
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
                setShowDomainForm(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
          
          {/* Domain Form */}
          {showDomainForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</CardTitle>
              </CardHeader>
              <CardContent>
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
                      control={domainForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDomainForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDomain ? "Update Domain" : "Add Domain"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Domains Table */}
          <Card>
            <CardContent className="p-0">
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
                  {domains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">No domains found</TableCell>
                    </TableRow>
                  ) : (
                    domains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>{domain.category}</TableCell>
                        <TableCell>${domain.price.toLocaleString()}</TableCell>
                        <TableCell>
                          {domain.isSold ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sold
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                setShowDomainForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteDomain(domain.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PAGE CONTENT TAB */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Page Content Management</h2>
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
                setShowContentForm(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Page Content
            </Button>
          </div>
          
          {/* Page Content Form */}
          {showContentForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingPageContent ? "Edit Page Content" : "Add New Page Content"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...pageContentForm}>
                  <form onSubmit={pageContentForm.handleSubmit(onPageContentSubmit)} className="space-y-4">
                    <FormField
                      control={pageContentForm.control}
                      name="pageKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Key</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly={!!editingPageContent} />
                          </FormControl>
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
                            <Textarea {...field} rows={10} />
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
                          <FormLabel>Meta Title</FormLabel>
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
                          <FormLabel>Meta Description</FormLabel>
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
                        onClick={() => setShowContentForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPageContent ? "Update Page Content" : "Add Page Content"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Page Content Table */}
          <Card>
            <CardContent className="p-0">
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
                      <TableCell colSpan={3} className="text-center py-4">No page contents found</TableCell>
                    </TableRow>
                  ) : (
                    pageContents.map((pageContent) => (
                      <TableRow key={pageContent.id}>
                        <TableCell className="font-medium">{pageContent.pageKey}</TableCell>
                        <TableCell>{pageContent.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingPageContent(pageContent);
                                setShowContentForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeletePageContent(pageContent.pageKey)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}