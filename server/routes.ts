import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertItemSchema, updateItemSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  
  const apiRouter = express.Router();
  
  // GET all inventory items
  apiRouter.get("/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory items" });
    }
  });
  
  // GET a single inventory item by ID
  apiRouter.get("/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const item = await storage.getItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory item" });
    }
  });
  
  // POST create a new inventory item
  apiRouter.post("/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const createdItem = await storage.createItem(validatedData);
      res.status(201).json(createdItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid item data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Error creating inventory item" });
      }
    }
  });
  
  // PATCH update an existing inventory item
  apiRouter.patch("/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const validatedData = updateItemSchema.parse(req.body);
      const updatedItem = await storage.updateItem(id, validatedData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid item data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Error updating inventory item" });
      }
    }
  });
  
  // DELETE an inventory item
  apiRouter.delete("/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      // Check if item exists first
      const item = await storage.getItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const success = await storage.deleteItem(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete item" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting inventory item" });
    }
  });
  
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
