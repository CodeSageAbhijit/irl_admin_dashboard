import { users, type User, type InsertUser, type Item, type InsertItem, type UpdateItem } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory item methods
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  getItemByItemId(itemId: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private items: Map<number, Item>;
  private userIdCounter: number;
  private itemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.userIdCounter = 1;
    this.itemIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Inventory item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(
      (item) => item.itemId === itemId
    );
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.itemIdCounter++;
    const itemId = `INV-${String(id).padStart(4, '0')}`;
    const status = insertItem.quantity > 0 
      ? (insertItem.quantity <= 10 ? "Low Stock" : "In Stock") 
      : "Out of Stock";
    
    const now = new Date();
    
    const item: Item = { 
      ...insertItem, 
      id, 
      itemId, 
      status, 
      lastUpdated: now 
    };
    
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: number, updateItem: UpdateItem): Promise<Item | undefined> {
    const item = this.items.get(id);
    
    if (!item) {
      return undefined;
    }
    
    // Calculate new status based on updated quantity
    const status = updateItem.quantity > 0 
      ? (updateItem.quantity <= 10 ? "Low Stock" : "In Stock") 
      : "Out of Stock";
    
    const now = new Date();
    
    const updatedItem: Item = { 
      ...item, 
      ...updateItem, 
      status, 
      lastUpdated: now 
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }
}

export const storage = new MemStorage();
