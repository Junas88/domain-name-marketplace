import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageContent } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenIcon, PlusIcon, Loader2, TrashIcon } from "lucide-react";

// Page content form schema
const pageContentFormSchema = z.object({
  pageKey: z.string().min(1, "Page key is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Form types
type PageContentFormValues = z.infer<typeof pageContentFormSchema>;

interface PageContentManagementProps {
  pageContents: PageContent[];
  isLoading: boolean;
}

export default function PageContentManagement({ pageContents, isLoading }: PageContentManagementProps) {
  const { toast } = useToast();
  const [showPageContentDialog, setShowPageContentDialog] = useState(false);
  const [editingPageContent, setEditingPageContent] = useState<PageContent | null>(null);

  // Page content form
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

  // Effect to update form when editing page content
  if (editingPageContent) {
    pageContentForm.setValue("pageKey", editingPageContent.pageKey);
    pageContentForm.setValue("title", editingPageContent.title);
    pageContentForm.setValue("content", editingPageContent.content);
    pageContentForm.setValue("metaTitle", editingPageContent.metaTitle || "");
    pageContentForm.setValue("metaDescription", editingPageContent.metaDescription || "");
  }

  // Mutations
  const addPageContentMutation = useMutation({
    mutationFn: async (data: PageContentFormValues) => {
      const res = await apiRequest("/api/admin/page-contents", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
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

  // Form handlers
  const onPageContentSubmit = (data: PageContentFormValues) => {
    if (editingPageContent) {
      updatePageContentMutation.mutate({ pageKey: editingPageContent.pageKey, content: data });
    } else {
      addPageContentMutation.mutate(data);
    }
  };

  // Event handlers
  const handleDeletePageContent = (pageKey: string) => {
    if (window.confirm("Are you sure you want to delete this page content?")) {
      deletePageContentMutation.mutate(pageKey);
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
                        <Input {...field} disabled={!!editingPageContent} />
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
            {pageContents.map((pageContent) => (
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
                        setShowPageContentDialog(true);
                      }}
                    >
                      <PenIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePageContent(pageContent.pageKey)}
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
    </div>
  );
}