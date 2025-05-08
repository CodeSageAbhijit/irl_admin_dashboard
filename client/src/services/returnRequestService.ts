import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../server/firebase.ts';
import { returnRequest, ApprovalStatus } from '../types/request';

// Collection reference
const returnRequestsCollection = collection(db, 'return_requests');




/**
 * Get all return requests from Firestore
 */
export async function getAllReturnRequests(): Promise<returnRequest[]> {
  try {
    const snapshot = await getDocs(returnRequestsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as returnRequest;
      return data;
    });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    throw error;
  }
}

/**
 * Get a single return request by ID
 */
export async function getReturnRequestById(requestId: string): Promise<returnRequest | null> {
  try {
    const q = query(returnRequestsCollection, where('request_id', '==', requestId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as returnRequest;
  } catch (error) {
    console.error(`Error fetching return request with ID ${requestId}:`, error);
    throw error;
  }
}

/**
 * Update a return request's approval status
 */
export async function updateReturnRequestStatus(
  requestId: string, 
  status: ApprovalStatus
): Promise<boolean> {
  try {
    // First find the document with the matching request_id
    const q = query(returnRequestsCollection, where('request_id', '==', requestId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error(`No return request found with ID ${requestId}`);
      return false;
    }
    
    // Get the document reference and update it   
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
      status: status
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating return request with ID ${requestId}:`, error);
    throw error;
  }
}

/**
 * Get pending return requests
 */
export async function getPendingReturnRequests(): Promise<returnRequest[]> {
  try {
    const q = query(returnRequestsCollection, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data() as any;
        // Map status to approval_status for compatibility with our interface
        return {
          ...data,
          approval_status: data.status
        } as returnRequest;
      });
  } catch (error) {
    console.error('Error fetching pending return requests:', error);
    throw error;
  }
}

/**
 * Get approved or declined return requests
 */
export async function getProcessedReturnRequests(): Promise<returnRequest[]> {
  try {
    const approvedQuery = query(returnRequestsCollection, where('status', '==', 'approved'));
    const declinedQuery = query(returnRequestsCollection, where('status', '==', 'declined'));
    
    const approvedSnapshot = await getDocs(approvedQuery);
    const declinedSnapshot = await getDocs(declinedQuery);
    
    const approvedRequests = approvedSnapshot.docs.map(doc => doc.data() as returnRequest);
    const declinedRequests = declinedSnapshot.docs.map(doc => doc.data() as returnRequest);
    
    return [...approvedRequests, ...declinedRequests];
  } catch (error) {
    console.error('Error fetching processed return requests:', error);
    throw error;
  }
}