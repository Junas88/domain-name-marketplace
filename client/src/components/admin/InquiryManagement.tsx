import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Inquiry, InquiryStatus, Communication } from "@/lib/types";
import { 
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckIcon, 
  Clock,
  Edit,
  Flag,
  Loader2,
  MailIcon,
  MessageCircle,
  PhoneIcon,
  RefreshCw,
  Search,
  Tag,
  User
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Status colors
const statusColors = {
  new: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  negotiating: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  closed: "bg-green-100 text-green-800 hover:bg-green-200",
  lost: "bg-red-100 text-red-800 hover:bg-red-200"
};

// Priority colors
const priorityColors = {
  0: "", // Normal - no color highlight
  1: "bg-orange-50 border-l-4 border-orange-400", // High priority
  2: "bg-red-50 border-l-4 border-red-500" // Urgent
};

// Priority labels
const priorityLabels = {
  0: "Normal",
  1: "High",
  2: "Urgent"
};

// Status icons
const statusIcons = {
  new: <Tag className="h-4 w-4 mr-1" />,
  in_progress: <Clock className="h-4 w-4 mr-1" />,
  negotiating: <MessageCircle className="h-4 w-4 mr-1" />,
  closed: <CheckIcon className="h-4 w-4 mr-1" />,
  lost: <AlertTriangle className="h-4 w-4 mr-1" />
};

// Schema for communication form
const communicationFormSchema = z.object({
  message: z.string().min(1, "Message is required"),
  direction: z.enum(["incoming", "outgoing"], {
    required_error: "Please select a direction"
  })
});

// Schema for inquiry update form
const inquiryUpdateFormSchema = z.object({
  status: z.enum(["new", "in_progress", "negotiating", "closed", "lost"], {
    required_error: "Please select a status"
  }),
  priority: z.coerce.number().min(0).max(2),
  notes: z.string().optional().nullable(),
  nextFollowUpAt: z.string().optional().nullable()
});

type CommunicationFormValues = z.infer<typeof communicationFormSchema>;
type InquiryUpdateFormValues = z.infer<typeof inquiryUpdateFormSchema>;

export default function InquiryManagement() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch all inquiries
  const { 
    data: inquiries = [], 
    isLoading: isLoadingInquiries,
    refetch: refetchInquiries 
  } = useQuery<Inquiry[]>({
    queryKey: ['/api/admin/inquiries'],
  });

  // Fetch communications for selected inquiry
  const { 
    data: communications = [],
    isLoading: isLoadingCommunications,
    refetch: refetchCommunications 
  } = useQuery<Communication[]>({
    queryKey: ['/api/admin/inquiries', selectedInquiry?.id, 'communications'],
    enabled: !!selectedInquiry?.id,
  });

  // Filtered inquiries based on status and search
  const filteredInquiries = inquiries.filter(inquiry => {
    // Filter by status
    if (statusFilter !== "all" && inquiry.status !== statusFilter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        inquiry.name.toLowerCase().includes(query) ||
        inquiry.email.toLowerCase().includes(query) ||
        inquiry.message.toLowerCase().includes(query) ||
        inquiry.domainName?.toLowerCase().includes(query) ||
        (inquiry.notes && inquiry.notes.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Form for adding a communication
  const communicationForm = useForm<CommunicationFormValues>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      message: "",
      direction: "outgoing"
    }
  });

  // Form for updating an inquiry
  const inquiryUpdateForm = useForm<InquiryUpdateFormValues>({
    resolver: zodResolver(inquiryUpdateFormSchema),
    defaultValues: {
      status: "new",
      priority: 0,
      notes: "",
      nextFollowUpAt: null
    }
  });

  // Reset the form when selected inquiry changes
  useEffect(() => {
    if (selectedInquiry) {
      inquiryUpdateForm.reset({
        status: selectedInquiry.status,
        priority: selectedInquiry.priority,
        notes: selectedInquiry.notes,
        nextFollowUpAt: selectedInquiry.nextFollowUpAt
      });
    }
  }, [selectedInquiry, inquiryUpdateForm]);

  // Mutation for adding a communication
  const addCommunicationMutation = useMutation({
    mutationFn: async (data: CommunicationFormValues) => {
      if (!selectedInquiry) throw new Error("No inquiry selected");
      
      const res = await apiRequest(
        `/api/admin/inquiries/${selectedInquiry.id}/communications`, {
          method: "POST", 
          body: JSON.stringify(data)
        }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Communication added",
        description: "The communication has been successfully added",
      });
      communicationForm.reset();
      setShowCommunicationDialog(false);
      
      // Update inquiries and communications data
      refetchInquiries();
      if (selectedInquiry) {
        refetchCommunications();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding communication",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for updating an inquiry
  const updateInquiryMutation = useMutation({
    mutationFn: async (data: InquiryUpdateFormValues) => {
      if (!selectedInquiry) throw new Error("No inquiry selected");
      
      const res = await apiRequest(
        `/api/admin/inquiries/${selectedInquiry.id}`, {
          method: "PATCH",
          body: JSON.stringify(data)
        }
      );
      return await res.json();
    },
    onSuccess: (updatedInquiry) => {
      toast({
        title: "Inquiry updated",
        description: "The inquiry has been successfully updated",
      });
      setShowUpdateDialog(false);
      
      // Update inquiries data
      refetchInquiries();
      
      // Update the selectedInquiry with the updated data
      setSelectedInquiry(updatedInquiry);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating inquiry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle status update directly (quick action)
  const handleStatusUpdate = async (inquiryId: number, status: InquiryStatus) => {
    try {
      await apiRequest(
        `/api/admin/inquiries/${inquiryId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status })
        }
      );
      
      toast({
        title: "Status updated",
        description: `Status changed to ${status}`,
      });
      
      // Refetch inquiries to update the list
      refetchInquiries();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Failed to update the inquiry status",
        variant: "destructive"
      });
    }
  };

  // Handle priority update directly (quick action)
  const handlePriorityUpdate = async (inquiryId: number, priority: number) => {
    try {
      await apiRequest(
        `/api/admin/inquiries/${inquiryId}/priority`, {
          method: "PATCH",
          body: JSON.stringify({ priority })
        }
      );
      
      toast({
        title: "Priority updated",
        description: `Priority changed to ${priorityLabels[priority as keyof typeof priorityLabels]}`,
      });
      
      // Refetch inquiries to update the list
      refetchInquiries();
    } catch (error) {
      toast({
        title: "Error updating priority",
        description: "Failed to update the inquiry priority",
        variant: "destructive"
      });
    }
  };

  // Handle communication form submission
  const onSubmitCommunication = (data: CommunicationFormValues) => {
    addCommunicationMutation.mutate(data);
  };

  // Handle inquiry update form submission
  const onSubmitInquiryUpdate = (data: InquiryUpdateFormValues) => {
    updateInquiryMutation.mutate(data);
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (isLoadingInquiries) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{
              inquiries.filter(inquiry => inquiry.status === "new").length
            }</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{
              inquiries.filter(inquiry => 
                inquiry.status === "in_progress" || inquiry.status === "negotiating"
              ).length
            }</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{
              inquiries.length ? 
                `${Math.round((inquiries.filter(inquiry => inquiry.status === "closed").length / inquiries.length) * 100)}%` : 
                "0%"
            }</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            className="pl-8"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InquiryStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={() => {
            refetchInquiries();
            setSearchQuery("");
            setStatusFilter("all");
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Inquiries table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => (
                <TableRow 
                  key={inquiry.id}
                  className={`${priorityColors[inquiry.priority as keyof typeof priorityColors]}`}
                >
                  <TableCell className="font-medium">{inquiry.domainName || `Domain ID: ${inquiry.domainId}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {inquiry.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs text-gray-500">
                        <MailIcon className="h-3 w-3 mr-1" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {inquiry.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[inquiry.status]}>
                      {statusIcons[inquiry.status]}
                      {inquiry.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {inquiry.priority > 0 && (
                        <Flag 
                          className={`h-4 w-4 mr-2 ${
                            inquiry.priority === 1 ? 'text-orange-500' : 'text-red-500'
                          }`} 
                        />
                      )}
                      <span>{priorityLabels[inquiry.priority as keyof typeof priorityLabels]}</span>
                      
                      {/* Priority quick actions */}
                      <div className="ml-2 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const newPriority = Math.min(2, inquiry.priority + 1);
                            if (newPriority !== inquiry.priority) {
                              handlePriorityUpdate(inquiry.id, newPriority);
                            }
                          }}
                          disabled={inquiry.priority >= 2}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const newPriority = Math.max(0, inquiry.priority - 1);
                            if (newPriority !== inquiry.priority) {
                              handlePriorityUpdate(inquiry.id, newPriority);
                            }
                          }}
                          disabled={inquiry.priority <= 0}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{formatDate(inquiry.lastContactedAt)}</span>
                      {inquiry.lastContactedAt && (
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(inquiry.lastContactedAt)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowCommunicationDialog(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowUpdateDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Communication Dialog */}
      {selectedInquiry && (
        <Dialog 
          open={showCommunicationDialog} 
          onOpenChange={setShowCommunicationDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Communicate with {selectedInquiry.name}</DialogTitle>
              <DialogDescription>
                Domain: {selectedInquiry.domainName || `ID: ${selectedInquiry.domainId}`}
              </DialogDescription>
            </DialogHeader>
            
            {/* Communication history */}
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3 mb-4">
              {isLoadingCommunications ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : communications.length > 0 ? (
                communications.map((communication) => (
                  <div 
                    key={communication.id}
                    className={`p-3 rounded-lg ${
                      communication.direction === "outgoing" 
                        ? "bg-blue-50 ml-8" 
                        : "bg-gray-50 mr-8"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">
                        {communication.direction === "outgoing" ? "You" : selectedInquiry.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(communication.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm">{communication.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-2">No communication history</p>
              )}
            </div>
            
            {/* Communication form */}
            <Form {...communicationForm}>
              <form 
                onSubmit={communicationForm.handleSubmit(onSubmitCommunication)}
                className="space-y-4"
              >
                <FormField
                  control={communicationForm.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="outgoing">Outgoing (from you)</SelectItem>
                          <SelectItem value="incoming">Incoming (from customer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={communicationForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your message..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCommunicationDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addCommunicationMutation.isPending}
                  >
                    {addCommunicationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Message
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Update Inquiry Dialog */}
      {selectedInquiry && (
        <Dialog 
          open={showUpdateDialog} 
          onOpenChange={setShowUpdateDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Inquiry</DialogTitle>
              <DialogDescription>
                {selectedInquiry.name} - {selectedInquiry.domainName || `Domain ID: ${selectedInquiry.domainId}`}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...inquiryUpdateForm}>
              <form 
                onSubmit={inquiryUpdateForm.handleSubmit(onSubmitInquiryUpdate)}
                className="space-y-4"
              >
                <FormField
                  control={inquiryUpdateForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="negotiating">Negotiating</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inquiryUpdateForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Normal</SelectItem>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inquiryUpdateForm.control}
                  name="nextFollowUpAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Input 
                            type="datetime-local"
                            {...field}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        When you plan to follow up with this inquiry
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inquiryUpdateForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add private notes about this inquiry..."
                          {...field}
                          value={field.value || ''}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateInquiryMutation.isPending}
                  >
                    {updateInquiryMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Inquiry
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}