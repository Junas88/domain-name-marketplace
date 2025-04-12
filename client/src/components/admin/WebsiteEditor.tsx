import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, EyeIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Page content form schema
const editorFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

// Form types
type EditorFormValues = z.infer<typeof editorFormSchema>;

interface WebsiteEditorProps {
  pageContents: PageContent[];
  isLoading: boolean;
}

export default function WebsiteEditor({ pageContents, isLoading }: WebsiteEditorProps) {
  const { toast } = useToast();
  const [activePageKey, setActivePageKey] = useState("home");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const activePage = pageContents.find(page => page.pageKey === activePageKey);

  // Editor form
  const editorForm = useForm<EditorFormValues>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: {
      content: activePage?.content || "",
    }
  });

  // Set form content when active page changes
  if (activePage && activePage.content !== editorForm.getValues().content) {
    editorForm.setValue("content", activePage.content);
  }

  // Mutation to update page content
  const updatePageContentMutation = useMutation({
    mutationFn: async (data: { pageKey: string; content: string }) => {
      const res = await apiRequest(`/api/admin/page-contents/${data.pageKey}`, {
        method: "PATCH",
        body: JSON.stringify({ content: data.content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-contents'] });
      toast({
        title: "Content Updated",
        description: "The page content has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onEditorSubmit = (data: EditorFormValues) => {
    if (activePage) {
      updatePageContentMutation.mutate({ 
        pageKey: activePage.pageKey, 
        content: data.content 
      });
    }
  };

  // Parse JSON content for sections if available
  const parseSections = (content: string) => {
    try {
      const contentObj = JSON.parse(content);
      if (contentObj.sections && Array.isArray(contentObj.sections)) {
        return contentObj.sections;
      }
    } catch (e) {
      // Not JSON or invalid format
    }
    return null;
  };

  const sections = activePage ? parseSections(activePage.content) : null;

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
        <h2 className="text-xl font-bold">Website Editor</h2>
        <Button variant="outline">
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview Site
        </Button>
      </div>
      
      <Tabs defaultValue="homepage" value={activePageKey} onValueChange={setActivePageKey}>
        <TabsList className="mb-4">
          <TabsTrigger value="home">Homepage</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
          <TabsTrigger value="guide">Guide Page</TabsTrigger>
          <TabsTrigger value="contact">Contact Page</TabsTrigger>
          <TabsTrigger value="global">Global Elements</TabsTrigger>
        </TabsList>
        
        {pageContents.map((page) => (
          <TabsContent key={page.pageKey} value={page.pageKey} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>Edit the content for this page</CardDescription>
              </CardHeader>
              <CardContent>
                {sections ? (
                  <div className="space-y-4">
                    <Accordion type="single" collapsible>
                      {sections.map((section: any, index: number) => (
                        <AccordionItem key={index} value={`section-${index}`}>
                          <AccordionTrigger>
                            {section.title || `Section ${index + 1}`}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 border rounded-md space-y-4">
                              {Object.entries(section).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                  <label className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                  <Textarea 
                                    value={String(value)} 
                                    rows={typeof value === 'string' && value.length > 100 ? 5 : 2}
                                    onChange={(e) => {
                                      const newSections = [...sections];
                                      newSections[index] = {
                                        ...newSections[index],
                                        [key]: e.target.value
                                      };
                                      const newContent = JSON.stringify({ sections: newSections });
                                      editorForm.setValue("content", newContent);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={() => {
                          if (activePage) {
                            updatePageContentMutation.mutate({ 
                              pageKey: activePage.pageKey, 
                              content: editorForm.getValues().content 
                            });
                          }
                        }}
                      >
                        Save All Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form {...editorForm}>
                    <form onSubmit={editorForm.handleSubmit(onEditorSubmit)} className="space-y-4">
                      <FormField
                        control={editorForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Content</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={15} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}