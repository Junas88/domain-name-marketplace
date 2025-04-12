import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SeoSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PenIcon, PlusIcon, Loader2, TrashIcon } from "lucide-react";

// SEO settings form schema
const seoSettingsFormSchema = z.object({
  pageKey: z.string().min(1, "Page key is required"),
  title: z.string().min(1, "Title is required"),
  metaDescription: z.string().min(1, "Meta description is required"),
  metaKeywords: z.string().min(1, "Meta keywords are required"),
  structuredData: z.string().optional(),
});

// Form types
type SeoSettingsFormValues = z.infer<typeof seoSettingsFormSchema>;

interface SeoSettingsManagementProps {
  seoSettings: SeoSettings[];
  isLoading: boolean;
}

export default function SeoSettingsManagement({ seoSettings, isLoading }: SeoSettingsManagementProps) {
  const { toast } = useToast();
  const [showSeoSettingsDialog, setShowSeoSettingsDialog] = useState(false);
  const [editingSeoSettings, setEditingSeoSettings] = useState<SeoSettings | null>(null);

  // SEO settings form
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

  // Effect to update form when editing SEO settings
  if (editingSeoSettings) {
    seoSettingsForm.setValue("pageKey", editingSeoSettings.pageKey);
    seoSettingsForm.setValue("title", editingSeoSettings.title);
    seoSettingsForm.setValue("metaDescription", editingSeoSettings.metaDescription);
    seoSettingsForm.setValue("metaKeywords", editingSeoSettings.metaKeywords);
    seoSettingsForm.setValue("structuredData", editingSeoSettings.structuredData || "");
  }

  // Mutations
  const addSeoSettingsMutation = useMutation({
    mutationFn: async (data: SeoSettingsFormValues) => {
      const res = await apiRequest("/api/admin/seo-settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
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
  const onSeoSettingsSubmit = (data: SeoSettingsFormValues) => {
    if (editingSeoSettings) {
      updateSeoSettingsMutation.mutate({ pageKey: editingSeoSettings.pageKey, settings: data });
    } else {
      addSeoSettingsMutation.mutate(data);
    }
  };

  // Event handlers
  const handleDeleteSeoSettings = (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete these SEO settings?")) {
      deleteSeoSettingsMutation.mutate(pageKey);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                Enter the SEO settings for a page.
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
                        <Input {...field} disabled={!!editingSeoSettings} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={seoSettingsForm.control}
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
                      <FormLabel>Structured Data (JSON-LD)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={8} />
                      </FormControl>
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
                    {editingSeoSettings ? "Update Settings" : "Add Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO Management</CardTitle>
          <CardDescription>Optimize your site's search engine visibility</CardDescription>
        </CardHeader>
        <CardContent>
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
                {seoSettings.map((seo) => (
                  <TableRow key={seo.id}>
                    <TableCell className="font-medium">{seo.pageKey}</TableCell>
                    <TableCell>{seo.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingSeoSettings(seo);
                            setShowSeoSettingsDialog(true);
                          }}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSeoSettings(seo.pageKey)}
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
          <CardDescription>Tips to improve your site's search visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Each page should have a unique title (50-60 characters recommended)</li>
            <li>Meta descriptions should be 150-160 characters for optimal display in search results</li>
            <li>Use relevant keywords in titles, descriptions, and page content</li>
            <li>Add structured data to help search engines understand your content better</li>
            <li>Make sure all pages have proper heading structure (H1, H2, H3, etc.)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}