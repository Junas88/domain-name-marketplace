import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Domain } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Loader2, PenIcon, PlusIcon, TagIcon, TrashIcon } from "lucide-react";

// Domain form schema
const domainFormSchema = z.object({
  name: z.string().min(1, "Domain name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  length: z.coerce.number().min(1, "Length must be at least 1"),
});

// Form types
type DomainFormValues = z.infer<typeof domainFormSchema>;

interface DomainManagementProps {
  domains: Domain[];
  isLoading: boolean;
}

export default function DomainManagement({ domains, isLoading }: DomainManagementProps) {
  const { toast } = useToast();
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  
  // Domain form
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
  
  // Effect to update form when editing domain
  if (editingDomain) {
    domainForm.setValue("name", editingDomain.name);
    domainForm.setValue("description", editingDomain.description);
    domainForm.setValue("price", editingDomain.price);
    domainForm.setValue("category", editingDomain.category);
    domainForm.setValue("length", editingDomain.length);
  }
  
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
  
  // Form handlers
  const onDomainSubmit = (data: DomainFormValues) => {
    if (editingDomain) {
      updateDomainMutation.mutate({ id: editingDomain.id, domain: data });
    } else {
      addDomainMutation.mutate(data);
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
    </div>
  );
}