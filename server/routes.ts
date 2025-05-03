import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertItemSchema, updateItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { FirebaseStorage } from "./firestorage";


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
  
  // import { ZodError } from "zod";

apiRouter.patch("/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        message: "Invalid item ID",
        details: `Received ID: ${req.params.id}`
      });
    }

    const requestData = {
      name: req.body.name,
      quantity: req.body.quantity,
      image_url: req.body.imageUrl || req.body.image_url || null
    };

    // Then validate
    const validatedData = updateItemSchema.parse(requestData);

    const updatedItem = await storage.updateItem(id, validatedData);
    
    if (!updatedItem) {
      console.error(`Item not found: ${id}`);
      return res.status(404).json({ 
        message: "Item not found",
        itemId: id
      });
    }

    // Log successful update
    console.log(`Successfully updated item ${id}:`, updatedItem);
    
    return res.json(updatedItem);

  } catch (error) {
    console.error("Error in PATCH /items/:id:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid item data", 
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })),
        receivedData: req.body
      });
    }

    // Handle specific database errors if you're using a DB
    // if (error instanceof SomeDatabaseError) {
    //   return res.status(500).json({
    //     message: "Database error",
    //     details: error.message
    //   });
    // }

    return res.status(500).json({ 
      message: "Internal server error",
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
