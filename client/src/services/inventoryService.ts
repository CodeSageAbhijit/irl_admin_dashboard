import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem } from '../types/request';
import type { Item } from '@shared/schema';

// Collection reference (shared)
const itemsCollection = collection(db, 'inventory_items');

export async function getItems(): Promise<Item[]> {
  const snapshot = await getDocs(itemsCollection);
  return snapshot.docs.map(d => d.data() as Item);
}

export async function createItem(data: { name: string; quantity: number; image_url?: string | null }): Promise<Item> {
  const id = Date.now();
  const item: Item = {
    id,
    name: data.name,
    quantity: data.quantity ?? 0,
    image_url: data.image_url ?? null,
  };
  await setDoc(doc(itemsCollection, String(id)), item);
  return item;
}

export async function updateItem(id: number, data: Partial<{ name: string; quantity: number; image_url: string | null }>): Promise<Item> {
  const docRef = doc(itemsCollection, String(id));
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error('Item not found');
  const current = snapshot.data() as Item;
  const updated: Item = { ...current, ...data };
  await setDoc(docRef, updated);
  return updated;
}

export async function deleteItem(id: number): Promise<void> {
  await deleteDoc(doc(itemsCollection, String(id)));
}

/**
 * Find an inventory item by name
 */
export async function findInventoryItemByName(name: string) {
  try {
    const q = query(itemsCollection, where('name', '==', name));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      data: snapshot.docs[0].data(),
      ref: snapshot.docs[0].ref
    };
  } catch (error) {
    console.error(`Error finding inventory item with name ${name}:`, error);
    throw error;
  }
}

/**
 * Find an inventory item by ID
 */
export async function findInventoryItemById(id: number) {
  try {
    const q = query(itemsCollection, where('id', '==', id));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      data: snapshot.docs[0].data(),
      ref: snapshot.docs[0].ref
    };
  } catch (error) {
    console.error(`Error finding inventory item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update inventory quantities for multiple items
 * For checkout requests, quantities are decreased
 * @param cartItems List of cart items to adjust quantities for
 * @param isReturn If true, quantities are increased (for returns), otherwise decreased (for checkouts)
 */
export async function updateInventoryQuantities(
  cartItems: CartItem[],
  isReturn: boolean = false
): Promise<boolean> {
  try {
    let successCount = 0;
    let failureCount = 0;
    
    // Process each item in the cart
    for (const item of cartItems) {
      try {
        // Find the inventory item by ID
        const inventoryItem = await findInventoryItemById(item.id);
        
        if (!inventoryItem) {
          console.warn(`Inventory item with ID ${item.id} not found`);
          failureCount++;
          continue;
        }
        
        const currentData = inventoryItem.data;
        const currentQuantity = currentData.quantity || 0;
        
        // Calculate new quantity
        const quantityChange = item.selected_quantity || 1;
        const newQuantity = isReturn 
          ? currentQuantity + quantityChange   // Add for returns
          : currentQuantity - quantityChange;  // Subtract for checkouts

        // Ensure quantity doesn't go below zero for checkouts
        const finalQuantity = Math.max(0, newQuantity);
        
        // Update the inventory item
        await updateDoc(inventoryItem.ref, {
          quantity: finalQuantity
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error updating inventory for item ${item.name}:`, error);
        failureCount++;
      }
    }
    
    console.log(`Inventory update completed: ${successCount} successful, ${failureCount} failed`);
    
    // Return true if at least one item was updated successfully
    return successCount > 0;
  } catch (error) {
    console.error('Error updating inventory quantities:', error);
    throw error;
  }
}