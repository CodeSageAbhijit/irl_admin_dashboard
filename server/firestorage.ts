import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

import type { IStorage } from "./storage";
import type { User, InsertUser, Item, InsertItem, UpdateItem } from "@shared/schema";

export class FirebaseStorage implements IStorage {
  private usersCollection = collection(db, "Users");
  private itemsCollection = collection(db, "inventory_items");

  // === USER METHODS ===

  async getUser(id: number): Promise<User | undefined> {
    const userDoc = await getDoc(doc(this.usersCollection, String(id)));
    return userDoc.exists() ? (userDoc.data() as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(this.usersCollection, where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = Date.now(); // or use Firestore auto ID if you want
    const newUser: User = { ...user, id };
    await setDoc(doc(this.usersCollection, String(id)), newUser);
    return newUser;
  }

  // === ITEM METHODS ===

  async getItems(): Promise<Item[]> {
    const snapshot = await getDocs(this.itemsCollection);
    return snapshot.docs.map(doc => doc.data() as Item);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const itemDoc = await getDoc(doc(this.itemsCollection, String(id)));
    return itemDoc.exists() ? (itemDoc.data() as Item) : undefined;
  }

  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    const q = query(this.itemsCollection, where("itemId", "==", itemId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as Item;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = Date.now(); // Generate a unique identifier for the item
    const quantity = insertItem.quantity ?? 0; // Default quantity to 0 if not provided
  
    const item: Item = {
      id,
      name: insertItem.name, // Required field
      quantity, // Required field
      image_url: insertItem.image_url ?? null, // Optional field
    };
  
    // Save the item to the Firebase collection
    await setDoc(doc(this.itemsCollection, String(id)), item);
  
    return item;
  }

  async updateItem(id: number, updateItem: UpdateItem): Promise<Item | undefined> {
    const docRef = doc(this.itemsCollection, String(id));
    const snapshot = await getDoc(docRef);
  
    if (!snapshot.exists()) return undefined;
  
    const current = snapshot.data() as Item;
    const quantity = updateItem.quantity ?? current.quantity; // Default to current quantity if not provided
  
    // Create the updated item object
    const updated: Item = {
      ...current,
      ...updateItem, // Overwrite fields with updateItem values
      quantity, // Ensure quantity is updated
      image_url: updateItem.image_url ?? current.image_url, // Update imageUrl if provided
    };
  
    // Save the updated item to the database
    await setDoc(docRef, updated);
    return updated;
  }

  async deleteItem(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(this.itemsCollection, String(id))); // Delete the item from Firestore
      return true; // Return true if the deletion was successful
    } catch (error) {
      console.error("Error deleting item:", error); // Log the error if deletion fails
      return false; // Return false if there was an error
    }
  }
}
