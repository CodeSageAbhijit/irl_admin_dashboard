import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../../server/firebase.ts';
// Collection reference
const usersCollection = collection(db, 'Users');

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: number;
  
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const q = query(usersCollection, where('id', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`No user found with ID ${userId}`);
      return null;
    }
    
    const userData = snapshot.docs[0].data() as User;
    return userData;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    return null;
  }
}

/**
 * Get a user by UID
 */
export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const userDoc = doc(usersCollection, uid);
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      // If not found by direct ID, try with where query
      const q = query(usersCollection, where('id', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`No user found with UID ${uid}`);
        return null;
      }
      
      const userData = querySnapshot.docs[0].data() as User;
      return userData;
    }
    
    const userData = snapshot.data() as User;
    return userData;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    return null;
  }
}

/**
 * Format user's full name from user data
 */
export function formatUserName(user: User | null): string {
  if (!user) return "Unknown User";
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else {
    return "Unknown User";
  }
}