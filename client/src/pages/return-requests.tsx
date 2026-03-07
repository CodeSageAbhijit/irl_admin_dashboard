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
        <div key={index} className="bg-white rounded-xl border border-[#E8EFF6] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#E8EFF6] to-[#F6F7F9] animate-pulse" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-24 rounded" />
            <div className="space-y-3 pt-1">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-lg flex-shrink-0" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-50 space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-xl" />
            <Skeleton className="h-9 flex-1 rounded-xl" />
          </div>
        </div>
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
    <div className="min-h-screen bg-[#F6F7F9]">
      <Sidebar mobileOpen={sidebarMobile} setMobileOpen={setSidebarMobile} />
      
      <div className="md:ml-[260px] flex flex-col min-h-screen">
        <Header 
          toggleSidebar={() => setSidebarMobile(!sidebarMobile)} 
          searchValue=""
          onSearchChange={() => {}}
        />
        
        <main className="flex-1 p-5 md:p-7 space-y-6">
          <div>
            <h1 className="page-title">Return Requests</h1>
            <p className="page-subtitle">Manage and review inventory return requests from users</p>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-white border border-[#E8EFF6] rounded-xl p-1 h-auto gap-1">
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-[#3563E9] data-[state=active]:text-white data-[state=active]:shadow-md text-[#90A3BF] font-medium text-sm px-5 py-2 transition-all">Pending Approval</TabsTrigger>
              <TabsTrigger value="processed" className="rounded-lg data-[state=active]:bg-[#3563E9] data-[state=active]:text-white data-[state=active]:shadow-md text-[#90A3BF] font-medium text-sm px-5 py-2 transition-all">Processed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingReturnRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : pendingReturnRequestsQuery.error ? (
                <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-red-300" />
                  </div>
                  <p className="text-red-500 font-semibold mb-4">Failed to load pending return requests</p>
                  <Button onClick={() => pendingReturnRequestsQuery.refetch()} variant="outline" className="rounded-lg">Retry</Button>
                </div>
              ) : pendingReturnRequestsQuery.data?.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8EFF6] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F6F7F9] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-[#90A3BF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-1">No Pending Return Requests</h3>
                  <p className="text-sm text-[#90A3BF]">All return requests have been processed. Check the processed tab for history.</p>
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
                <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-red-300" />
                  </div>
                  <p className="text-red-500 font-semibold mb-4">Failed to load processed return requests</p>
                  <Button onClick={() => processedReturnRequestsQuery.refetch()} variant="outline" className="rounded-lg">Retry</Button>
                </div>
              ) : processedReturnRequestsQuery.data?.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8EFF6] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F6F7F9] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-[#90A3BF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-1">No Processed Return Requests</h3>
                  <p className="text-sm text-[#90A3BF]">No return requests have been approved or declined yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E8EFF6] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F6F7F9] hover:bg-[#F6F7F9] border-b border-[#E8EFF6]">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pl-5">Request ID</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Items</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Timestamp</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pr-5">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedReturnRequestsQuery.data?.map((request) => (
                        <TableRow key={request.request_id} className="hover:bg-[#F6F7F9] transition-colors border-b border-[#E8EFF6]">
                          <TableCell className="py-3 pl-5">
                            <span className="text-xs font-mono font-semibold text-[#90A3BF] bg-[#F6F7F9] px-2 py-0.5 rounded-lg border border-[#E8EFF6]">{request.request_id.substring(0, 8)}...</span>
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-[#1A202C]">{request.items.length} items</TableCell>
                          <TableCell className="py-3 text-sm text-[#90A3BF]">{formatTimestamp(request.timestamp)}</TableCell>
                          <TableCell className="py-3 pr-5">{getStatusBadge((request.status || (request as any).status) as ApprovalStatus)}</TableCell>
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
    <Card className="rounded-xl border-[#E8EFF6] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-mono text-[#90A3BF] bg-[#F6F7F9] px-2 py-0.5 rounded-lg border border-[#E8EFF6] text-xs">
            <RotateCcw className="h-3 w-3 text-amber-500" />
            {request.request_id.substring(0, 10)}...
          </span>
          {getStatusBadge(status as ApprovalStatus)}
        </CardTitle>
          <CardDescription className="text-xs text-[#90A3BF] mt-1">
          {formatTimestamp(request.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 pb-4">
        <div className="flex items-start gap-2.5 text-sm">
          <div className="w-6 h-6 bg-[#EEF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-[#3563E9]" />
          </div>
          <span className="text-[#1A202C] font-medium">
            {isUserLoading
              ? "Loading user..."
              : user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : `User: ${request.user_id.substring(0, 8)}...`}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <span className="text-[#1A202C]">{request.items.length} items returning</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-50">
          <h4 className="text-xs font-semibold text-[#90A3BF] uppercase tracking-wider mb-2">Returning Items</h4>
          <ul className="space-y-1.5">
            {request.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-1 px-2.5 bg-[#F6F7F9] rounded-lg">
                <span className="text-xs font-medium text-[#1A202C]">{item.name}</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">×{item.selected_quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      {showActions && request.status === 'pending' && (
        <CardFooter className="flex gap-2 pt-0 pb-4 px-4">
          <Button 
            className="flex-1 btn-primary rounded-lg h-9 text-sm font-semibold" 
            onClick={() => onApprove(request.request_id, request)}
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
          </Button>
          <Button 
            variant="outline"
            className="flex-1 rounded-lg h-9 text-sm font-semibold border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
            onClick={() => onDecline(request.request_id)}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
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
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-xs font-semibold">
        <CheckCircle className="w-3 h-3 mr-1" /> Approved
      </Badge>;
    case 'declined':
      return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0 text-xs font-semibold">
        <XCircle className="w-3 h-3 mr-1" /> Declined
      </Badge>;
    case 'pending':
    default:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-xs font-semibold">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>;
  }
}