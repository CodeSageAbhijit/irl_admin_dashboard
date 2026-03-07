import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllRequests, 
  updateRequestStatus,
  getPendingRequests, 
  getProcessedRequests 
} from "../services/requestService";
import { updateInventoryQuantities } from "../services/inventoryService";
import { Request, ApprovalStatus } from "../types/request";
import { getUserByUid, formatUserName } from "../services/userService";
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
    mutationFn: async ({ requestId, status, request }: { requestId: string, status: ApprovalStatus, request?: Request }) => {
      // First update the request status
      const updated = await updateRequestStatus(requestId, status);
  
      // If approved and we have the request details, update inventory quantities
      if (status === 'Approved' && request && request.cart_items) {
        try {
          await updateInventoryQuantities(request.cart_items);
          console.log('Inventory quantities updated successfully');
        } catch (error) {
          console.error('Failed to update inventory quantities:', error);
        }
      }
  
      return updated;
    },
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
            <h1 className="page-title">Requests</h1>
            <p className="page-subtitle">Manage and review inventory requests from users</p>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-white border border-[#E8EFF6] rounded-xl p-1 h-auto gap-1">
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-[#3563E9] data-[state=active]:text-white data-[state=active]:shadow-md text-[#90A3BF] font-medium text-sm px-5 py-2 transition-all">Pending Approval</TabsTrigger>
              <TabsTrigger value="processed" className="rounded-lg data-[state=active]:bg-[#3563E9] data-[state=active]:text-white data-[state=active]:shadow-md text-[#90A3BF] font-medium text-sm px-5 py-2 transition-all">Processed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingRequestsQuery.isPending ? (
                <RequestsLoadingSkeleton />
              ) : pendingRequestsQuery.error ? (
                <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-red-300" />
                  </div>
                  <p className="text-red-500 font-semibold mb-4">Failed to load pending requests</p>
                  <Button onClick={() => pendingRequestsQuery.refetch()} variant="outline" className="rounded-lg">Retry</Button>
                </div>
              ) : pendingRequestsQuery.data?.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8EFF6] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F6F7F9] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-[#90A3BF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-1">No Pending Requests</h3>
                  <p className="text-sm text-[#90A3BF]">All requests have been processed. Check the processed tab for history.</p>
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
                <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-red-300" />
                  </div>
                  <p className="text-red-500 font-semibold mb-4">Failed to load processed requests</p>
                  <Button onClick={() => processedRequestsQuery.refetch()} variant="outline" className="rounded-lg">Retry</Button>
                </div>
              ) : processedRequestsQuery.data?.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8EFF6] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F6F7F9] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-[#90A3BF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A202C] mb-1">No Processed Requests</h3>
                  <p className="text-sm text-[#90A3BF]">No requests have been approved or declined yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E8EFF6] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F6F7F9] hover:bg-[#F6F7F9] border-b border-[#E8EFF6]">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pl-5">Requested By</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Items</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Purpose</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Duration</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5">Timestamp</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-[#90A3BF] py-3.5 pr-5">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRequestsQuery.data?.map((request) => (
                        <TableRow key={request.request_id} className="hover:bg-[#F6F7F9] transition-colors border-b border-[#E8EFF6]">
                          <TableCell className="py-3 pl-5">
                            <span className="text-xs font-mono font-semibold text-[#90A3BF] bg-[#F6F7F9] px-2 py-0.5 rounded-lg border border-[#E8EFF6]">{request.request_id.substring(0, 8)}...</span>
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-[#1A202C]">{request.cart_items.length} items</TableCell>
                          <TableCell className="py-3 text-sm text-[#1A202C] max-w-[180px] truncate">{request.purpose}</TableCell>
                          <TableCell className="py-3 text-sm text-[#1A202C]">{request.duration} days</TableCell>
                          <TableCell className="py-3 text-sm text-[#90A3BF]">{formatTimestamp(request.timestamp)}</TableCell>
                          <TableCell className="py-3 pr-5">{getStatusBadge(request.approval_status)}</TableCell>
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
  onApprove: (id: string, request: Request) => void, 
  onDecline: (id: string) => void, 
  showActions?: boolean 
}) {
  // Fetch user data
  const userQuery = useQuery({
    queryKey: ['user', request.user_id],
    queryFn: () => getUserByUid(request.user_id)
  });
  
  // User's name display
  const userName = userQuery.data 
    ? formatUserName(userQuery.data)
    : userQuery.isLoading 
      ? "Loading user..." 
      : "Unknown User";
  return (
    <Card className="rounded-xl border-[#E8EFF6] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#3563E9] to-[#54A6FF]" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="font-mono text-[#90A3BF] bg-[#F6F7F9] px-2 py-0.5 rounded-lg border border-[#E8EFF6] text-xs">{request.request_id.substring(0, 10)}...</span>
          {getStatusBadge(request.approval_status)}
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
          <span className="text-[#1A202C] font-medium">{userName}</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <div className="w-6 h-6 bg-[#EEF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-3.5 w-3.5 text-[#3563E9]" />
          </div>
          <span className="text-[#1A202C]">{request.cart_items.length} items requested</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <div className="w-6 h-6 bg-[#EEF3FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarClock className="h-3.5 w-3.5 text-[#3563E9]" />
          </div>
          <span className="text-[#1A202C]">{request.duration} days</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <div className="w-6 h-6 bg-[#FFF5EE] rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="h-3.5 w-3.5 text-[#FF9500]" />
          </div>
          <span className="text-[#1A202C] line-clamp-2">{request.purpose}</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-50">
          <h4 className="text-xs font-semibold text-[#90A3BF] uppercase tracking-wider mb-2">Requested Items</h4>
          <ul className="space-y-1.5">
            {request.cart_items.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-1 px-2.5 bg-[#F6F7F9] rounded-lg">
                <span className="text-xs font-medium text-[#1A202C]">{item.name}</span>
                <span className="text-xs font-bold text-[#3563E9] bg-[#EEF3FF] px-2 py-0.5 rounded-md">×{item.selected_quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      {showActions && request.approval_status === 'Pending' && (
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

// Loading skeleton for requests
function RequestsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-[#E8EFF6] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#3563E9]/20 to-[#54A6FF]/20 animate-pulse" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-24 rounded" />
            <div className="space-y-3 pt-1">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-lg flex-shrink-0" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-50 space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-8 w-full rounded-lg" />
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
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-xs font-semibold">
        <CheckCircle className="w-3 h-3 mr-1" /> Approved
      </Badge>;
    case 'Declined':
      return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0 text-xs font-semibold">
        <XCircle className="w-3 h-3 mr-1" /> Declined
      </Badge>;
    case 'Pending':
    default:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-xs font-semibold">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>;
  }
}