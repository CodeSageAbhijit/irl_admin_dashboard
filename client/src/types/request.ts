export interface CartItem {
    description: string;
    id: number;
    image_url: string;
    name: string;
    qr_code: string;
    quantity: number;
    selected_quantity: number;
  }
  
  export type ApprovalStatus = 'Pending' | 'Approved' | 'Declined' | 'pending' | 'approved' | 'declined';
  
  
  
  export interface Request {
    approval_status: ApprovalStatus;
    cart_items: CartItem[];
    duration: number;
    purpose: string;
    request_id: string;
    timestamp: string;
    user_id: string;
  }

  export interface returnRequest {
    status: ApprovalStatus;
    items: CartItem[];
    updated_at: number;
    request_id: string;
    timestamp: string;
    user_id: string;
  }

  export interface User {
    email: string;
    phoneNumber: number;
    fcm_token: string;
    username: string;
    firstName: string;
    lastName: string;
    id: string;
    
  }