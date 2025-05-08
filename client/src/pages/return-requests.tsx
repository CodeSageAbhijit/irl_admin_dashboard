import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllReturnRequests, 
  updateReturnRequestStatus,
  getPendingReturnRequests, 
  getProcessedReturnRequests 
} from "../services/returnRequestService";
import { updateInventoryQuantities } from "../services/inventoryService";
import {  returnRequest, ApprovalStatus } from "../types/request";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { getUserById } from "../services/userService";


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
  CalendarClock,
  RotateCcw 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Header from "../components/header";
import Footer from "../components/footer";
import Sidebar from "../components/sidebar";

function RequestsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="animate-pulse bg-gray-200 rounded-md w-3/4 h-6"></CardTitle>
            <CardDescription className="animate-pulse bg-gray-200 rounded-md w-1/2 h-4"></CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="animate-pulse bg-gray-200 rounded-md w-1/3 h-4"></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="animate-pulse bg-gray-200 rounded-md w-1/2 h-4"></span>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 animate-pulse bg-gray-200 rounded-md w-1/2 h-4"></h4>
              <ul className="text-sm space-y-1 pl-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <li key={i} className="flex justify-between animate-pulse">
                    <span className="bg-gray-200 rounded-md w-2/3 h-4"></span>
                    <span className="text-muted-foreground bg-gray-200 rounded-md w-1/4 h-4"></span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ReturnRequests() {
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();
  
  // Query for fetching pending return requests
  const pendingReturnRequestsQuery = useQuery({
    queryKey: ['return-requests', 'pending'],
    queryFn: getPendingReturnRequests
  });
  
  // Query for fetching processed return requests (approved or declined)
  const processedReturnRequestsQuery = useQuery({
    queryKey: ['return-requests', 'processed'],
    queryFn: getProcessedReturnRequests
  });
  
  // Mutation for updating return request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, request }: { requestId: string, status: ApprovalStatus, request?: returnRequest }) => {
      // First update the request status
      const updated = await updateReturnRequestStatus(requestId, status);
  
      // If approved and we have the request details, update inventory quantities
      if (status === 'approved' && request && request.items) {
        try {
          await updateInventoryQuantities(request.items, true); // true flag for returns
          console.log('Inventory quantities updated successfully for returns');
        } catch (error) {
          console.error('Failed to update inventory quantities:', error);
        }
      }
  
      return updated;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    }
  });
  
  
  // Handle approval
  const handleApprove = (requestId: string, request: returnRequest) => {
    updateStatusMutation.mutate({ requestId, status: 'approved', request });
  };
  
  
  // Handle decline
  const handleDecline = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'declined' });
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
            <h1 className="text-2xl font-bold tracking-tight">Return Requests</h1>
            <p className="text-muted-foreground">
              Manage and review inventory return requests from users
            </p>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingReturnRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : pendingReturnRequestsQuery.error ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <p className="text-red-500 mb-4">Failed to load pending return requests</p>
                  <Button onClick={() => pendingReturnRequestsQuery.refetch()}>Retry</Button>
                </div>
              ) : pendingReturnRequestsQuery.data?.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <Info className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">No Pending Return Requests</h3>
                  <p className="text-muted-foreground">
                    All return requests have been processed. Check the processed tab for history.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingReturnRequestsQuery.data?.map((request) => (
                    <ReturnRequestCard 
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
              {processedReturnRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : processedReturnRequestsQuery.error ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <p className="text-red-500 mb-4">Failed to load processed return requests</p>
                  <Button onClick={() => processedReturnRequestsQuery.refetch()}>Retry</Button>
                </div>
              ) : processedReturnRequestsQuery.data?.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <Info className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">No Processed Return Requests</h3>
                  <p className="text-muted-foreground">
                    No return requests have been approved or declined yet.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableCaption>History of processed return requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Items</TableHead>
                        
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedReturnRequestsQuery.data?.map((request) => (
                        <TableRow key={request.request_id}>
                          <TableCell className="font-medium">{request.request_id.substring(0, 8)}...</TableCell>
                          <TableCell>{request.items.length} items</TableCell>
                          
                          <TableCell>{formatTimestamp(request.timestamp)}</TableCell>
                          <TableCell>{getStatusBadge((request.status || (request as any).status) as ApprovalStatus)}</TableCell>                        </TableRow>
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

// Return request card component for pending requests
function ReturnRequestCard({ 
  request, 
  onApprove, 
  onDecline, 
  showActions = false 
}: { 
  request: returnRequest, 
  onApprove: (id: string, request: returnRequest) => void, 
  onDecline: (id: string) => void, 
  showActions?: boolean 
})  {
  const status = request.status || (request as any).status || 'pending';

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', request.user_id],
    queryFn: () => getUserById(request.user_id),
    staleTime: 1000 * 60 * 5, // cache user for 5 minutes
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2 text-amber-500" />
            Return {request.request_id.substring(0, 8)}...
          </span>
          {getStatusBadge(status as ApprovalStatus)}
        </CardTitle>
        <CardDescription>
          {formatTimestamp(request.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>
            {isUserLoading
              ? "Loading user..."
              :  user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : `User ID: ${request.user_id.substring(0, 8)}...`}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <span>{request.items.length} items returning</span>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Returning Items:</h4>
          <ul className="text-sm space-y-1 pl-2">
            {request.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span className="text-muted-foreground">Qty: {item.selected_quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      {showActions && request.status === 'pending' && (
        <CardFooter className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => onApprove(request.request_id, request)}
            disabled={request.status !== 'pending'}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Approve
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1" 
            onClick={() => onDecline(request.request_id)}
            disabled={request.status !== 'pending'}
          >
            <XCircle className="mr-2 h-4 w-4" /> Decline
          </Button>
        </CardFooter>
      )}
    </Card>
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
    case 'approved':
      return <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" /> Approved
      </Badge>;
    case 'declined':
      return <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" /> Declined
      </Badge>;
    case 'pending':
    default:
      return <Badge variant="outline" className="border-amber-500 text-amber-500">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>;
  }
}