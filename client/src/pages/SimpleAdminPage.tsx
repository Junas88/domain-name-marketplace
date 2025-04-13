import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, Loader2, Plus, Pencil, Trash, Check, Tag, 
  CircleCheck, Upload, Search, Download, File, Save,
  AlertTriangle, Eye, X, FileText, ExternalLink,
  Layout, ListChecks, Quote, Award, BookOpen, Contact,
  HelpCircle, Info, BarChart, LineChart, PieChart, 
  Activity, Clock, Users, ArrowUpRight, ArrowDownRight,
  Phone, Share2, MessageSquare, RefreshCw, Shield, Mail
} from "lucide-react";
import InquiryManagement from "@/components/admin/InquiryManagement";
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
  const [activeGoogleTab, setActiveGoogleTab] = useState("search-console");
  
  // Analytics state
  const [pageViewsData, setPageViewsData] = useState<{
    page: string;
    views: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }[]>([
    { page: "Home", views: 1842, avgTimeOnPage: 92, bounceRate: 36 },
    { page: "Premium Domains", views: 3756, avgTimeOnPage: 145, bounceRate: 28 },
    { page: "Domain Guide", views: 1276, avgTimeOnPage: 215, bounceRate: 22 },
    { page: "About", views: 487, avgTimeOnPage: 68, bounceRate: 45 },
    { page: "Contact", views: 694, avgTimeOnPage: 73, bounceRate: 38 },
  ]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Helper functions for page content display
  // Using the getPageKeyTitle function defined below
  
  const getPageKeyDescription = (pageKey: string): string => {
    const mapping: Record<string, string> = {
      // Home Page Sections
      'hero': 'Main banner and headline on homepage',
      'features': 'Key features and benefits of the platform',
      
      // Contact Page Sections
      'contact': 'Main contact page content',
      'contact-info': 'Contact details (email, phone, address)',
      
      // Guide Page Sections
      'guide-intro': 'Domain guide introduction',
      'guide-content': 'Main content of the domain guide',
      'guide-checklist': 'Domain checklist items',
      
      // Domain Finder Page
      'domain-finder': 'Overall domain finder page',
      'domain-finder-intro': 'Domain finder introduction',
      'domain-finder-steps': 'Steps for finding the right domain',
      
      // FAQ Page
      'faqs': 'FAQ page content and questions',
      'faqs-intro': 'Introduction to FAQs section',
      
      // Buyer Protection
      'buyer-protection': 'Overall buyer protection content',
      'buyer-protection-intro': 'Introduction to buyer protection',
      'buyer-protection-steps': 'Buyer protection process steps',
      
      // How It Works
      'how-it-works': 'Overall how it works content',
      'how-it-works-intro': 'Introduction to how the platform works',
      'how-it-works-steps': 'Steps explaining the platform process',
      
      // Selling Strategy
      'selling-strategy': 'Overall selling strategy content',
      'selling-strategy-intro': 'Introduction to selling domains',
      'selling-strategy-tips': 'Tips for selling domains effectively',
      
      // Ebook Section
      'ebook-section': 'Ebook download section settings',
      'ebook-intro': 'Introduction to the ebook offering',
      
      // Miscellaneous Sections
      'footer': 'Website footer content',
      'newsletter': 'Newsletter signup text',
      'privacy-policy': 'Privacy policy legal content',
      'terms-of-service': 'Terms of service legal content',
      'about-us': 'About us page content',
      
      // Legal Pages
      'privacy': 'Privacy policy and cookie usage information',
      'terms': 'Terms and conditions of service'
    };
    return mapping[pageKey] || 'Website content';
  };
  
  const getPageKeyIcon = (pageKey: string): React.ReactNode => {
    const iconMapping: Record<string, React.ReactNode> = {
      // Home Page Sections
      'hero': <Layout className="h-8 w-8 mb-2" />,
      'features': <ListChecks className="h-8 w-8 mb-2" />,
      
      // Contact Page Sections
      'contact': <Contact className="h-8 w-8 mb-2" />,
      'contact-info': <Phone className="h-8 w-8 mb-2" />,
      
      // Guide Page Sections
      'guide-intro': <BookOpen className="h-8 w-8 mb-2" />,
      'guide-content': <FileText className="h-8 w-8 mb-2" />,
      'guide-checklist': <CircleCheck className="h-8 w-8 mb-2" />,
      
      // Domain Finder Page
      'domain-finder': <Search className="h-8 w-8 mb-2" />,
      'domain-finder-intro': <Info className="h-8 w-8 mb-2" />,
      'domain-finder-steps': <ListChecks className="h-8 w-8 mb-2" />,
      
      // FAQ Page
      'faqs': <HelpCircle className="h-8 w-8 mb-2" />,
      'faqs-intro': <Info className="h-8 w-8 mb-2" />,
      
      // Buyer Protection
      'buyer-protection': <Shield className="h-8 w-8 mb-2" />,
      'buyer-protection-intro': <Info className="h-8 w-8 mb-2" />,
      'buyer-protection-steps': <ListChecks className="h-8 w-8 mb-2" />,
      
      // How It Works
      'how-it-works': <RefreshCw className="h-8 w-8 mb-2" />,
      'how-it-works-intro': <Info className="h-8 w-8 mb-2" />,
      'how-it-works-steps': <ListChecks className="h-8 w-8 mb-2" />,
      
      // Selling Strategy
      'selling-strategy': <Tag className="h-8 w-8 mb-2" />,
      'selling-strategy-intro': <Info className="h-8 w-8 mb-2" />,
      'selling-strategy-tips': <ListChecks className="h-8 w-8 mb-2" />,
      
      // Ebook Section
      'ebook-section': <BookOpen className="h-8 w-8 mb-2" />,
      'ebook-intro': <Info className="h-8 w-8 mb-2" />,
      
      // Miscellaneous Sections
      'footer': <Layout className="h-8 w-8 mb-2" />,
      'newsletter': <Mail className="h-8 w-8 mb-2" />,
      'privacy-policy': <FileText className="h-8 w-8 mb-2" />,
      'terms-of-service': <FileText className="h-8 w-8 mb-2" />,
      'about-us': <Users className="h-8 w-8 mb-2" />,
      
      // Legal Pages
      'privacy': <Shield className="h-8 w-8 mb-2" />,
      'terms': <FileText className="h-8 w-8 mb-2" />
    };
    return iconMapping[pageKey] || <File className="h-8 w-8 mb-2" />;
  };
  
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
  
  // Ebook info query
  const { data: ebookInfo, refetch: refetchEbookInfo } = useQuery<{
    exists: boolean;
    fileName?: string;
    filePath?: string;
    fileSize?: string;
    downloadCount: number;
  }>({
    queryKey: ['/api/admin/ebook-info'],
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
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
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
      const res = await fetch(`/api/admin/domains/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
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
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
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
      const res = await fetch(`/api/admin/domains/${id}/mark-sold`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });
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
      const res = await fetch(`/api/admin/page-contents/${data.pageKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.content),
        credentials: 'include'
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
      setContentDialogOpen(false);
      contentForm.reset();
      setEditingContent(null);
      
      // Invalidate admin page contents cache
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Special handling for contact pages - cross-invalidate both contact and contact-info
      if (data && data.pageKey === 'contact') {
        console.log("Contact page updated - invalidating both contact and contact-info");
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact`] });
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact-info`] });
      } else if (data && data.pageKey === 'contact-info') {
        console.log("Contact info updated - invalidating both contact and contact-info");
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact`] });
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact-info`] });
      } else if (data && data.pageKey) {
        // For other pages, invalidate the specific page content
        console.log(`Invalidating page content: ${data.pageKey}`);
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${data.pageKey}`] });
      }
      
      // Force invalidate ALL page content queries to ensure the frontend is updated
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents'] });
      
      // Invalidate related queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
      
      // Hard refetch
      refetchContents();
      
      // Force a window reload after a short delay to ensure fresh data on the frontend
      setTimeout(() => {
        console.log("Forcing refetch of all queries");
        queryClient.refetchQueries({ type: 'all' });
      }, 500);
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
      const res = await fetch(`/api/admin/seo-settings/${data.pageKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.seo),
        credentials: 'include'
      });
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
    
  // Function removed since page content editor is no longer part of the admin panel
  
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
    
    // Log what's happening for debugging
    console.log(`${editingContent ? 'Updating' : 'Creating'} content for page key: ${values.pageKey}`);
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
  
  // Helper function to get user-friendly title for a page key
  const getPageKeyTitle = (pageKey: string): string => {
    const pageKeyMap: Record<string, string> = {
      'hero': 'Hero Section',
      'features': 'Features Section',
      'domain-guide': 'Domain Guide',
      'ebook': 'E-book Section',
      'contact': 'Contact Us',
      'contact-info': 'Contact Information',
      'about': 'About Us',
      'faq': 'Frequently Asked Questions',
      'social-media': 'Social Media Links',
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'finder': 'Domain Finder',
      'testimonials': 'Testimonials'
    };
    
    return pageKeyMap[pageKey] || pageKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
  
  // Handle editing content
  // This function is defined further down in the file
  
  // Create page content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: InsertPageContent) => {
      const res = await fetch("/api/admin/page-contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Page content created successfully",
      });
      setContentDialogOpen(false);
      contentForm.reset();
      setEditingContent(null);
      
      // Invalidate both admin and public endpoints
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      
      // Special handling for contact pages - cross-invalidate both contact and contact-info
      if (data && data.pageKey === 'contact') {
        console.log("Contact page created - invalidating both contact and contact-info");
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact`] });
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact-info`] });
      } else if (data && data.pageKey === 'contact-info') {
        console.log("Contact info created - invalidating both contact and contact-info");
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact`] });
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/contact-info`] });
      } else if (data && data.pageKey) {
        // For other pages, invalidate the specific page content
        console.log(`Invalidating page content: ${data.pageKey}`);
        queryClient.invalidateQueries({ queryKey: [`/api/page-contents/${data.pageKey}`] });
      }
      
      // Also invalidate any general routes that might include this content
      queryClient.invalidateQueries({ queryKey: ['/api/page-contents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
      
      // Hard refetch contents
      refetchContents();
      
      // Force a window reload after a short delay to ensure fresh data on the frontend
      setTimeout(() => {
        console.log("Forcing refetch of all queries after content creation");
        queryClient.refetchQueries({ type: 'all' });
      }, 500);
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
    
    // Special case for contact-info with pre-filled template for Call Us, Email Us, Visit Us
    if (pageKey === 'contact-info') {
      const existingContent = content?.content || "";
      const templateContent = existingContent.length > 0 ? existingContent : 
`Email Us
support@domainnameguide.com

Call Us
+1 (555) 123-4567

Visit Us
123 Domain Street, Suite 100
New York, NY 10001`;
      
      setEditingContent(content || null);
      setDialogTitle(content ? 'Edit Contact Information' : 'Add Contact Information');
      contentForm.reset({
        pageKey: 'contact-info',
        title: content?.title || 'Contact Information',
        content: templateContent,
        metaTitle: content?.metaTitle || "",
        metaDescription: content?.metaDescription || "",
      });
      setContentDialogOpen(true);
      console.log(`Editing content for page key: ${pageKey}`);
      return;
    }
    
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
    
    // Log what's happening for debugging
    console.log(`${content ? 'Editing' : 'Creating'} content for page key: ${pageKey}`);
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
  
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  
  // Contact form related state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    pageKey: string,
    title: string,
    email: string,
    phone: string,
    hours: string,
    address: string
  }>({
    pageKey: 'contact-info',
    title: 'Contact Information',
    email: '',
    phone: '',
    hours: '',
    address: ''
  });
  
  // Handle ebook upload
  const handleEbookUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadingFile(true);
    
    try {
      const formData = new FormData();
      formData.append('ebook', file);
      
      const response = await fetch('/api/admin/upload-ebook', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload ebook');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Ebook uploaded successfully",
      });
      
      // Clear file input
      if (fileInputRef) {
        fileInputRef.value = '';
      }
      
      // Refresh ebook info
      refetchEbookInfo();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to upload ebook: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
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
        {/* Google Integration Section */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="mr-2">
              <path fill="#4285F4" d="M12 11v2h2v2H9v-4h3zm0-9a9.01 9.01 0 0 0-9 9 9.01 9.01 0 0 0 9 9 9.01 9.01 0 0 0 9-9 9.01 9.01 0 0 0-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
            Google Integration Tools
          </h2>
          <p className="text-gray-600 mb-4">Connect your domain marketplace with Google services for better visibility, analytics, and monetization</p>
          
          <Tabs defaultValue="search-console" value={activeGoogleTab} onValueChange={setActiveGoogleTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="search-console">Search Console</TabsTrigger>
              <TabsTrigger value="google-analytics">Google Analytics</TabsTrigger>
              <TabsTrigger value="adsense">AdSense</TabsTrigger>
            </TabsList>
            
            {/* Search Console Tab */}
            <TabsContent value="search-console" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Search Console</CardTitle>
                  <CardDescription>Monitor your site's performance in Google search results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Site Verification</h3>
                      <p className="mb-4">Verify your site ownership to access Search Console features</p>
                      <div className="flex space-x-2">
                        <Input placeholder="Enter your verification code" />
                        <Button>Verify</Button>
                      </div>
                    </div>
                    
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Performance Overview</h3>
                      <p className="mb-4">Your site is not yet fully verified with Google Search Console</p>
                      <Button variant="outline">Connect Search Console</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Google Analytics Tab */}
            <TabsContent value="google-analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Analytics</CardTitle>
                  <CardDescription>View insights about your website visitors and behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Analytics Setup</h3>
                      <p className="mb-4">Connect your Google Analytics account to track website metrics</p>
                      <div className="flex space-x-2">
                        <Input placeholder="Enter your Google Analytics ID (G-XXXXXXXXXX)" />
                        <Button>Connect</Button>
                      </div>
                    </div>
                    
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                      <p className="mb-4">Your site is not yet connected to Google Analytics</p>
                      <Button variant="outline">View in Google Analytics</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AdSense Tab */}
            <TabsContent value="adsense" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google AdSense</CardTitle>
                  <CardDescription>Monetize your website with targeted ads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">AdSense Setup</h3>
                      <p className="mb-4">Connect your Google AdSense account to display ads on your site</p>
                      <div className="flex space-x-2">
                        <Input placeholder="Enter your AdSense Publisher ID (pub-xxxxxxxxxx)" />
                        <Button>Connect</Button>
                      </div>
                    </div>
                    
                    <div className="p-6 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">AdSense Performance</h3>
                      <p className="mb-4">Your site is not yet connected to Google AdSense</p>
                      <Button variant="outline">View in AdSense</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="emails">Email Submissions</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="editor">Website Editor</TabsTrigger>
          <TabsTrigger value="ebooks">Ebook Files</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* INQUIRIES TAB */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Inquiry Management</h2>
          </div>
          <InquiryManagement />
        </TabsContent>
        
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
                {domains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((domain) => (
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
            
            {/* Pagination Controls */}
            {domains.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, domains.length)}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, domains.length)}</span> of{" "}
                  <span className="font-medium">{domains.length}</span> domains
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(domains.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(domains.length / itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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
        
        {/* WEBSITE EDITOR TAB */}
        <TabsContent value="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-black">Website Content Editor</h2>
              <p className="text-gray-500">Edit website content sections. Changes will be immediately visible on the site.</p>
            </div>
            <Button onClick={() => {
              setEditingContent(null);
              contentForm.reset({
                pageKey: "",
                title: "",
                content: "",
                metaTitle: "",
                metaDescription: "",
              });
              setDialogTitle("Create New Content Section");
              setContentDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Home Page Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Home Page</CardTitle>
                <CardDescription>Edit home page content sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Layout className="h-5 w-5 mr-2 text-gray-600" />
                    Hero Section
                  </h3>
                  {pageContents.some(content => content.pageKey === 'hero') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'hero')?.title || 'Hero Section'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('hero', 'Hero Section')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Main hero banner content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'hero')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('hero', 'Hero Section')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Hero Section</span>
                      <span className="text-xs text-gray-500 mt-1">Create main hero banner content</span>
                    </Button>
                  )}
                </div>
                
                {/* Features Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ListChecks className="h-5 w-5 mr-2 text-gray-600" />
                    Features Section
                  </h3>
                  {pageContents.some(content => content.pageKey === 'features') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'features')?.title || 'Features Section'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('features', 'Features Section')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Service features and highlights</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'features')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('features', 'Features Section')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Features Section</span>
                      <span className="text-xs text-gray-500 mt-1">Create service features and highlights</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Domain Guide Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Guide</CardTitle>
                <CardDescription>Edit domain guide content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Domain Guide Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                    Domain Guide Content
                  </h3>
                  {pageContents.some(content => content.pageKey === 'domain-guide') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'domain-guide')?.title || 'Domain Guide'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('domain-guide', 'Domain Guide')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Domain guide page content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'domain-guide')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('domain-guide', 'Domain Guide')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Domain Guide Content</span>
                      <span className="text-xs text-gray-500 mt-1">Create domain guide page content</span>
                    </Button>
                  )}
                </div>
                
                {/* E-book Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    E-book Section
                  </h3>
                  {pageContents.some(content => content.pageKey === 'ebook') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'ebook')?.title || 'E-book Section'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('ebook', 'E-book Section')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Free e-book offer details</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'ebook')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('ebook', 'E-book Section')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add E-book Section Content</span>
                      <span className="text-xs text-gray-500 mt-1">Create e-book offer content</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Global Components */}
            <Card>
              <CardHeader>
                <CardTitle>Global Components</CardTitle>
                <CardDescription>Edit components that appear on multiple pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Footer Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Layout className="h-5 w-5 mr-2 text-gray-600" />
                    Footer
                  </h3>
                  {pageContents.some(content => content.pageKey === 'footer') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'footer')?.title || 'Website Footer'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('footer', 'Website Footer')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Footer links, copyright text, and contact info</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'footer')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Footer Content</h4>
                              <Badge variant="outline" className="text-xs">Global Component</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-24 border-dashed flex flex-col items-center justify-center"
                      onClick={() => {
                        setEditingContent(null);
                        contentForm.reset({
                          pageKey: "footer",
                          title: "Website Footer",
                          content: "© 2025 Domain Name Guide. All Rights Reserved.\nContact: support@domainnameguide.com\nPhone: +1 (555) 123-4567\n\nPrivacy Policy | Terms of Service",
                          metaTitle: "",
                          metaDescription: "",
                        });
                        setDialogTitle("Create Footer Content");
                        setContentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Footer Content</span>
                      <span className="text-xs text-gray-500 mt-1">Create website footer with links and contact information</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Legal Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Legal Pages</CardTitle>
                <CardDescription>Edit legal content and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Privacy Policy */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-gray-600" />
                    Privacy Policy
                  </h3>
                  {pageContents.some(content => content.pageKey === 'privacy') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'privacy')?.title || 'Privacy Policy'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('privacy', 'Privacy Policy')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Privacy policy and data usage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'privacy')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('privacy', 'Privacy Policy')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Privacy Policy</span>
                      <span className="text-xs text-gray-500 mt-1">Create privacy policy content</span>
                    </Button>
                  )}
                </div>
                
                {/* Terms of Service */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Terms of Service
                  </h3>
                  {pageContents.some(content => content.pageKey === 'terms') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'terms')?.title || 'Terms of Service'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('terms', 'Terms of Service')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Terms and conditions of service</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'terms')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('terms', 'Terms of Service')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Terms of Service</span>
                      <span className="text-xs text-gray-500 mt-1">Create terms of service content</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Other Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Other Pages</CardTitle>
                <CardDescription>Edit additional pages on the site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Page Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Contact className="h-5 w-5 mr-2 text-gray-600" />
                    Contact Page
                  </h3>
                  {pageContents.some(content => content.pageKey === 'contact') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'contact')?.title || 'Contact Us'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('contact', 'Contact Us')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Main contact information and form</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Contact Page Content</h4>
                              <Badge variant="outline" className="text-xs">Page Content</Badge>
                            </div>
                            <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-500">Content preview:</span>
                                  <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                    {(() => {
                                      const content = pageContents.find(c => c.pageKey === 'contact')?.content;
                                      if (!content) return '<No content>';
                                      return content.length > 150 
                                        ? content.substring(0, 150) + '...' 
                                        : content;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Contact Information Details</h4>
                              <div className="flex space-x-2 items-center">
                                <div className="mr-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditContent('contact-info', 'Contact Information')}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Contact Info
                                  </Button>
                                </div>
                                <Badge variant="outline" className="text-xs">Call Us</Badge>
                                <Badge variant="outline" className="text-xs">Email Us</Badge>
                                <Badge variant="outline" className="text-xs">Visit Us</Badge>
                              </div>
                            </div>
                            <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-500">Contact info preview:</span>
                                  <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                    {(() => {
                                      const content = pageContents.find(c => c.pageKey === 'contact-info')?.content;
                                      if (!content) return '<No contact information>';
                                      return content.length > 150 
                                        ? content.substring(0, 150) + '...' 
                                        : content;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 italic mt-1">
                              <p><strong>Format your contact information with section headings:</strong></p>
                              <p className="mt-1">Example:</p>
                              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
Email Us
support@domainnameguide.com

Call Us
+1 (555) 123-4567

Visit Us
123 Domain Street, Suite 100
New York, NY 10001
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('contact', 'Contact Us')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Contact Page</span>
                      <span className="text-xs text-gray-500 mt-1">Create contact information and form</span>
                    </Button>
                  )}
                </div>
                
                {/* About Page Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-gray-600" />
                    About Page
                  </h3>
                  {pageContents.some(content => content.pageKey === 'about') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'about')?.title || 'About Us'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('about', 'About Us')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Company information and history</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'about')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('about', 'About Us')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add About Page</span>
                      <span className="text-xs text-gray-500 mt-1">Create company information and history</span>
                    </Button>
                  )}
                </div>
                
                {/* FAQ Page Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-gray-600" />
                    FAQ Page
                  </h3>
                  {pageContents.some(content => content.pageKey === 'faq') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'faq')?.title || 'Frequently Asked Questions'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('faq', 'Frequently Asked Questions')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Common questions and answers</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'faq')?.content;
                                  if (!content) return '<No content>';
                                  return content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => handleEditContent('faq', 'Frequently Asked Questions')}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add FAQ Page</span>
                      <span className="text-xs text-gray-500 mt-1">Create frequently asked questions</span>
                    </Button>
                  )}
                </div>
                
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-gray-600" />
                    Contact Information
                  </h3>
                  {pageContents.some(content => content.pageKey === 'contact-info') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'contact-info')?.title || 'Contact Information'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('contact-info', 'Contact Information')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Phone, address, and business hours</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'contact-info')?.content;
                                  return content?.length ? (content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content) : `Call Us
+1 (800) 123-4567

Monday-Friday, 9am-5pm EST

Visit Us
123 Domain Street
San Francisco, CA 94107`;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => {
                        // Pre-populate with default content
                        const defaultContent = `Call Us
+1 (800) 123-4567

Monday-Friday, 9am-5pm EST

Visit Us
123 Domain Street
San Francisco, CA 94107`;
                        
                        contentForm.reset({
                          pageKey: 'contact-info',
                          title: 'Contact Information',
                          content: defaultContent
                        });
                        setDialogTitle('Add Contact Information');
                        setEditingContent(null);
                        setContentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Contact Information</span>
                      <span className="text-xs text-gray-500 mt-1">Phone, address, and business hours</span>
                    </Button>
                  )}
                </div>
                
                {/* Social Media Links Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Share2 className="h-5 w-5 mr-2 text-gray-600" />
                    Social Media Links
                  </h3>
                  {pageContents.some(content => content.pageKey === 'social-media') ? (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {pageContents.find(content => content.pageKey === 'social-media')?.title || 'Social Media Links'}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditContent('social-media', 'Social Media Links')}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>Links to social media profiles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Content preview:</span>
                              <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                {(() => {
                                  const content = pageContents.find(c => c.pageKey === 'social-media')?.content;
                                  return content?.length ? (content.length > 150 
                                    ? content.substring(0, 150) + '...' 
                                    : content) : `Facebook: https://facebook.com/domainnameguide
Twitter: https://twitter.com/domainnameguide
LinkedIn: https://linkedin.com/company/domainnameguide
Instagram: https://instagram.com/domainnameguide`;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full py-6 flex flex-col items-center justify-center border-dashed"
                      onClick={() => {
                        // Pre-populate with default content
                        const defaultContent = `Facebook: https://facebook.com/domainnameguide
Twitter: https://twitter.com/domainnameguide
LinkedIn: https://linkedin.com/company/domainnameguide
Instagram: https://instagram.com/domainnameguide`;
                        
                        contentForm.reset({
                          pageKey: 'social-media',
                          title: 'Social Media Links',
                          content: defaultContent
                        });
                        setDialogTitle('Add Social Media Links');
                        setEditingContent(null);
                        setContentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-6 w-6 mb-2 text-gray-400" />
                      <span className="font-medium">Add Social Media Links</span>
                      <span className="text-xs text-gray-500 mt-1">Connect to your social profiles</span>
                    </Button>
                  )}
                </div>
                
                {/* Other Custom Content */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <File className="h-5 w-5 mr-2 text-gray-600" />
                    Other Custom Content
                  </h3>
                  <div className="space-y-4">
                    {pageContents
                      .filter(content => 
                        !content.pageKey.startsWith('home-') && 
                        !content.pageKey.startsWith('guide-') && 
                        content.pageKey !== 'contact' && 
                        content.pageKey !== 'about' && 
                        content.pageKey !== 'faq' &&
                        content.pageKey !== 'contact-info' &&
                        content.pageKey !== 'social-media'
                      )
                      .map(content => (
                        <Card key={content.pageKey} className="border-gray-200">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{content.title || 'Untitled Section'}</CardTitle>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditContent(content.pageKey, content.title || 'Section')}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            <CardDescription>{getPageKeyDescription(content.pageKey)}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md bg-gray-50 p-3 text-sm font-mono">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-500">Content preview:</span>
                                  <div className="mt-1 whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis border-l-2 border-gray-200 pl-3">
                                    {content.content?.length ? (content.content.length > 150 
                                      ? content.content.substring(0, 150) + '...' 
                                      : content.content) : '<No content>'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Content Edit Dialog */}
          <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>
                  Update the content for this section. Changes will be published immediately.
                </DialogDescription>
              </DialogHeader>
              <Form {...contentForm}>
                <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-4">
                  <FormField
                    control={contentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Section Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contentForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="HTML content or plain text..."
                            {...field}
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          You can use HTML tags to format content. Simple markdown is also supported.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contentForm.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Meta title for SEO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contentForm.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Meta description for SEO"
                            {...field}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">
                      {editingContent ? "Update Content" : "Create Content"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
            <div>
              <input
                type="file"
                accept="application/pdf"
                id="ebook-upload"
                className="hidden"
                onChange={handleEbookUpload}
                ref={(input) => setFileInputRef(input)}
              />
              <Button 
                onClick={() => fileInputRef?.click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Ebook
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {ebookInfo ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Domain Name Guide</CardTitle>
                  <CardDescription>
                    The complete guide to domain name acquisition and investment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ebookInfo.exists ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Format: PDF | Size: {ebookInfo.fileSize || '0'} MB | Filename: {ebookInfo.fileName || 'Domain Name Guide.pdf'}
                        </p>
                        <p className="text-sm mt-1">Downloads: {ebookInfo.downloadCount || 0}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open('/api/direct-download/ebook', '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef?.click()}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Replace
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3">
                      <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="h-10 w-10 text-yellow-500" />
                      </div>
                      <p className="text-center text-sm text-gray-600 mb-4">
                        No ebook file has been uploaded yet. Upload a PDF file to make it available for download.
                      </p>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef?.click()}
                          disabled={uploadingFile}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload PDF File
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="text-center text-sm text-gray-500 italic mt-4">
              <p>The ebook will be available for download on the Domain Guide page</p>
              <p className="mt-1">Uploading a new file will replace the existing one</p>
            </div>
          </div>
        </TabsContent>
        
        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-bold text-black">Page Analytics</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pageViewsData.reduce((sum, page) => sum + page.views, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 inline" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(pageViewsData.reduce((sum, page) => sum + (page.avgTimeOnPage * page.views), 0) / 
                  pageViewsData.reduce((sum, page) => sum + page.views, 0))}s
                </div>
                <p className="text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 inline" />
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Domain Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 inline" />
                  +18% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(pageViewsData.reduce((sum, page) => sum + page.views, 0) * 0.64).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 inline" />
                  +9% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Page Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>
                Metrics on page views, engagement, and bounce rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Page Views</TableHead>
                    <TableHead>Avg. Time on Page</TableHead>
                    <TableHead>Bounce Rate</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageViewsData.map((page) => (
                    <TableRow key={page.page}>
                      <TableCell className="font-medium">{page.page}</TableCell>
                      <TableCell>{page.views.toLocaleString()}</TableCell>
                      <TableCell>{page.avgTimeOnPage}s</TableCell>
                      <TableCell>{page.bounceRate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {page.avgTimeOnPage > 100 ? (
                            <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-2 text-amber-500" />
                          )}
                          {page.avgTimeOnPage > 100 ? "Good" : "Needs Improvement"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Domain Performance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Performance</CardTitle>
              <CardDescription>
                Metrics on domain views, engagement, and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Domain Views (Total)</h3>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Average of {Math.round(totalViews / totalDomains)} views per domain
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Conversion Rate</h3>
                  <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {soldDomains} domains sold out of {totalDomains}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Average Sale Price</h3>
                  <div className="text-2xl font-bold">${Math.round(averagePrice).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total revenue: ${totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Performing Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Domains</CardTitle>
              <CardDescription>
                Domains with the highest view counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...domains]
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 5)
                    .map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100">
                            <Tag className="h-3 w-3 mr-1 text-gray-500" />
                            {domain.category}
                          </span>
                        </TableCell>
                        <TableCell>{domain.viewCount || 0}</TableCell>
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
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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

      {/* Contact Info Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update your business contact information that appears on the contact page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-medium flex gap-2 items-center">
                  <Mail className="h-4 w-4 text-green-600" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  value={contactInfo.email} 
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="support@domainnameguide.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="font-medium flex gap-2 items-center">
                  <Phone className="h-4 w-4 text-green-600" />
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  value={contactInfo.phone} 
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  placeholder="+1 (800) 123-4567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="hours" className="font-medium flex gap-2 items-center">
                  <Clock className="h-4 w-4 text-green-600" />
                  Business Hours
                </Label>
                <Input 
                  id="hours" 
                  value={contactInfo.hours} 
                  onChange={(e) => setContactInfo({...contactInfo, hours: e.target.value})}
                  placeholder="Monday-Friday, 9am-5pm EST"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="font-medium flex gap-2 items-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Address
                </Label>
                <Textarea 
                  id="address" 
                  value={contactInfo.address} 
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  placeholder="123 Domain Street&#10;San Francisco, CA 94107"
                  className="mt-1 min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Generate formatted content
              const formattedContent = `Email Us
${contactInfo.email}

Call Us
${contactInfo.phone}

${contactInfo.hours}

Visit Us
${contactInfo.address}`;
              
              // Check if we're editing or creating
              const existingContent = pageContents.find(c => c.pageKey === contactInfo.pageKey);
              
              if (existingContent) {
                // Update existing content
                updateContentMutation.mutate({
                  id: existingContent.id,
                  pageKey: contactInfo.pageKey,
                  title: contactInfo.title,
                  content: formattedContent
                });
              } else {
                // Create new content
                createContentMutation.mutate({
                  pageKey: contactInfo.pageKey,
                  title: contactInfo.title,
                  content: formattedContent
                });
              }
              
              // Close dialog
              setDialogOpen(false);
              
              toast({
                title: "Success",
                description: `Contact information has been ${existingContent ? "updated" : "created"}`,
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}