import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllRequests, 
  updateRequestStatus,
  getPendingRequests, 
  getProcessedRequests 
} from "../services/requestService";
import { Request, ApprovalStatus } from "../types/request";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info, 
  Package, 
  Calendar, 
  User, 
  CalendarClock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Header from "../components/header";
import Footer from "../components/footer";
import Sidebar from "../components/sidebar";

export default function Requests() {
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();
  
  // Query for fetching pending requests
  const pendingRequestsQuery = useQuery({
    queryKey: ['requests', 'pending'],
    queryFn: getPendingRequests
  });
  
  // Query for fetching processed requests (approved or declined)
  const processedRequestsQuery = useQuery({
    queryKey: ['requests', 'processed'],
    queryFn: getProcessedRequests
  });
  
  // Mutation for updating request status
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string, status: ApprovalStatus }) => 
      updateRequestStatus(requestId, status),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
  
  // Handle approval
  const handleApprove = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'Approved' });
  };
  
  // Handle decline
  const handleDecline = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'Declined' });
  };
  
 
  // Get status badge
  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </Badge>;
      case 'Declined':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" /> Declined
        </Badge>;
      case 'Pending':
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Sidebar mobileOpen={sidebarMobile} setMobileOpen={setSidebarMobile} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          toggleSidebar={() => setSidebarMobile(!sidebarMobile)} 
          searchValue=""
          onSearchChange={() => {}}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground">
              Manage and review inventory requests from users
            </p>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : pendingRequestsQuery.error ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <p className="text-red-500 mb-4">Failed to load pending requests</p>
                  <Button onClick={() => pendingRequestsQuery.refetch()}>Retry</Button>
                </div>
              ) : pendingRequestsQuery.data?.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <Info className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    All requests have been processed. Check the processed tab for history.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingRequestsQuery.data?.map((request) => (
                    <RequestCard 
                      key={request.request_id} 
                      request={request} 
                      onApprove={handleApprove} 
                      onDecline={handleDecline} 
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="processed">
              {processedRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : processedRequestsQuery.error ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <p className="text-red-500 mb-4">Failed to load processed requests</p>
                  <Button onClick={() => processedRequestsQuery.refetch()}>Retry</Button>
                </div>
              ) : processedRequestsQuery.data?.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <Info className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">No Processed Requests</h3>
                  <p className="text-muted-foreground">
                    No requests have been approved or declined yet.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableCaption>History of processed requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRequestsQuery.data?.map((request) => (
                        <TableRow key={request.request_id}>
                          <TableCell className="font-medium">{request.request_id.substring(0, 8)}...</TableCell>
                          <TableCell>{request.cart_items.length} items</TableCell>
                          <TableCell>{request.purpose}</TableCell>
                          <TableCell>{request.duration} days</TableCell>
                          <TableCell>{formatTimestamp(request.timestamp)}</TableCell>
                          <TableCell>{getStatusBadge(request.approval_status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

// Request card component for pending requests
function RequestCard({ 
  request, 
  onApprove, 
  onDecline, 
  showActions = false 
}: { 
  request: Request, 
  onApprove: (id: string) => void, 
  onDecline: (id: string) => void, 
  showActions?: boolean 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Request {request.request_id.substring(0, 8)}...</span>
          {getStatusBadge(request.approval_status)}
        </CardTitle>
        <CardDescription>
          {formatTimestamp(request.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>User ID: {request.user_id.substring(0, 8)}...</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>{request.cart_items.length} items requested</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <CalendarClock className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>Duration: {request.duration} days</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>Purpose: {request.purpose}</span>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Requested Items:</h4>
          <ul className="text-sm space-y-1 pl-2">
            {request.cart_items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span className="text-muted-foreground">Qty: {item.selected_quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      {showActions && request.approval_status === 'Pending' && (
        <CardFooter className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => onApprove(request.request_id)}
            disabled={request.approval_status !== 'Pending'}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Approve
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1" 
            onClick={() => onDecline(request.request_id)}
            disabled={request.approval_status !== 'Pending'}
          >
            <XCircle className="mr-2 h-4 w-4" /> Decline
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Loading skeleton for requests
function RequestsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
            <div className="mt-4">
              <Skeleton className="h-5 w-1/3 mb-2" />
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-4 w-full mt-2" />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
// Format timestamp to relative time
function formatTimestamp(timestamp: string) {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return timestamp;
    }
  }
  
// Helper function to get status badge
function getStatusBadge(status: ApprovalStatus) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" /> Approved
      </Badge>;
    case 'Declined':
      return <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" /> Declined
      </Badge>;
    case 'Pending':
    default:
      return <Badge variant="outline" className="border-amber-500 text-amber-500">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>;
  }
}