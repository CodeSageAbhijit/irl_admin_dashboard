import { collection, getDocs, doc, getDoc, updateDoc, query, where, increment } from 'firebase/firestore';
import { db } from '../../../server/firebase.ts';
import { Request, ApprovalStatus } from '../types/request';

// Collection reference
const requestsCollection = collection(db, 'requests');
const inventoryCollection = collection(db, 'inventory_items');

/**
 * Get all requests from Firestore
 */
export async function getAllRequests(): Promise<Request[]> {
  try {
    const snapshot = await getDocs(requestsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Request;
      return data;
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
}

/**
 * Get a single request by ID
 */
export async function getRequestById(requestId: string): Promise<Request | null> {
  try {
    const q = query(requestsCollection, where('request_id', '==', requestId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as Request;
  } catch (error) {
    console.error(`Error fetching request with ID ${requestId}:`, error);
    throw error;
  }
}

/**
 * Update a request's approval status
 */
export async function updateRequestStatus(
  requestId: string, 
  status: ApprovalStatus
): Promise<boolean> {
  try {
    // 1. Find the request document
    const q = query(requestsCollection, where('request_id', '==', requestId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error(`No request found with ID ${requestId}`);
      return false;
    }
    
    const requestDoc = snapshot.docs[0];
    const requestData = requestDoc.data() as Request;
    const docRef = requestDoc.ref;

    // 2. Update the request status
    await updateDoc(docRef, {
      approval_status: status
    });

    // 3. If approved, process inventory deductions
    if (status === 'Approved') {
      for (const cartItem of requestData.cart_items) {
        try {
          // Find the corresponding inventory item
          const inventoryQuery = query(
            inventoryCollection, 
            where('id', '==', cartItem.id)
          );
          const inventorySnapshot = await getDocs(inventoryQuery);
          
          if (inventorySnapshot.empty) {
            console.warn(`Inventory item ${cartItem.item_id} not found`);
            continue;
          }

          const inventoryDoc = inventorySnapshot.docs[0];
          const currentQuantity = inventoryDoc.data().quantity;
          
          // Validate sufficient quantity
          if (currentQuantity < cartItem.selected_quantity) {
            console.error(`Insufficient quantity for item ${cartItem.item_id}`);
            continue;
          }

          // Update inventory with atomic increment (more reliable than final_quantity calculation)
          await updateDoc(inventoryDoc.ref, {
            quantity: increment(-cartItem.selected_quantity)
          });
          
          console.log(`Deducted ${cartItem.selected_quantity} from item ${cartItem.item_id}`);
        } catch (error) {
          console.error(`Error updating inventory for item ${cartItem.item_id}:`, error);
          // Continue with other items even if one fails
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating request with ID ${requestId}:`, error);
    throw error;
  }
}
/**
 * Get pending requests
 */
export async function getPendingRequests(): Promise<Request[]> {
  try {
    const q = query(requestsCollection, where('approval_status', '==', 'Pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Request);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
}

/**
 * Get approved or declined requests
 */
export async function getProcessedRequests(): Promise<Request[]> {
  try {
    const approvedQuery = query(requestsCollection, where('approval_status', '==', 'Approved'));
    const declinedQuery = query(requestsCollection, where('approval_status', '==', 'Declined'));
    
    const approvedSnapshot = await getDocs(approvedQuery);
    const declinedSnapshot = await getDocs(declinedQuery);
    
    const approvedRequests = approvedSnapshot.docs.map(doc => doc.data() as Request);
    const declinedRequests = declinedSnapshot.docs.map(doc => doc.data() as Request);
    
    return [...approvedRequests, ...declinedRequests];
  } catch (error) {
    console.error('Error fetching processed requests:', error);
    throw error;
  }
}