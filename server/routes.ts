import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCustomerSchema,
  insertEquipmentSchema,
  insertWorkOrderSchema,
  insertPartSchema,
  insertVendorSchema,
  insertShopSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Shop routes
  app.get('/api/shops', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shops = await storage.getUserShops(userId);
      res.json(shops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({ message: "Failed to fetch shops" });
    }
  });

  app.post('/api/shops', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shopData = insertShopSchema.parse(req.body);
      
      const shop = await storage.createShop(shopData);
      await storage.addUserToShop(userId, shop.id, 'admin');
      
      res.json(shop);
    } catch (error) {
      console.error("Error creating shop:", error);
      res.status(500).json({ message: "Failed to create shop" });
    }
  });

  app.get('/api/shops/:shopId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify user has access to this shop
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const shop = await storage.getShop(shopId);
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      res.json(shop);
    } catch (error) {
      console.error("Error fetching shop:", error);
      res.status(500).json({ message: "Failed to fetch shop" });
    }
  });

  // Dashboard metrics
  app.get('/api/shops/:shopId/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const metrics = await storage.getDashboardMetrics(shopId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Customer routes
  app.get('/api/shops/:shopId/customers', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const customers = await storage.getCustomers(shopId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/shops/:shopId/customers', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const customerData = insertCustomerSchema.parse({ ...req.body, shopId });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/shops/:shopId/customers/:customerId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, customerId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(shopId, customerId, updates);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/shops/:shopId/customers/:customerId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, customerId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      await storage.deleteCustomer(shopId, customerId);
      res.json({ message: "Customer deleted" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Equipment routes
  app.get('/api/shops/:shopId/equipment', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const equipment = await storage.getEquipment(shopId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get('/api/shops/:shopId/customers/:customerId/equipment', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, customerId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const equipment = await storage.getEquipmentByCustomer(shopId, customerId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching customer equipment:", error);
      res.status(500).json({ message: "Failed to fetch customer equipment" });
    }
  });

  app.post('/api/shops/:shopId/equipment', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const equipmentData = insertEquipmentSchema.parse({ ...req.body, shopId });
      const equipment = await storage.createEquipment(equipmentData);
      res.json(equipment);
    } catch (error) {
      console.error("Error creating equipment:", error);
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  // Work order routes
  app.get('/api/shops/:shopId/work-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const workOrders = await storage.getWorkOrders(shopId);
      res.json(workOrders);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({ message: "Failed to fetch work orders" });
    }
  });

  app.post('/api/shops/:shopId/work-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      // Generate order number
      const orderNumber = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const workOrderData = insertWorkOrderSchema.parse({ 
        ...req.body, 
        shopId,
        orderNumber 
      });
      const workOrder = await storage.createWorkOrder(workOrderData);
      res.json(workOrder);
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(500).json({ message: "Failed to create work order" });
    }
  });

  app.put('/api/shops/:shopId/work-orders/:workOrderId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, workOrderId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const updates = insertWorkOrderSchema.partial().parse(req.body);
      const workOrder = await storage.updateWorkOrder(shopId, workOrderId, updates);
      res.json(workOrder);
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(500).json({ message: "Failed to update work order" });
    }
  });

  // Parts routes
  app.get('/api/shops/:shopId/parts', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const parts = await storage.getParts(shopId);
      res.json(parts);
    } catch (error) {
      console.error("Error fetching parts:", error);
      res.status(500).json({ message: "Failed to fetch parts" });
    }
  });

  app.get('/api/shops/:shopId/parts/low-stock', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const parts = await storage.getLowStockParts(shopId);
      res.json(parts);
    } catch (error) {
      console.error("Error fetching low stock parts:", error);
      res.status(500).json({ message: "Failed to fetch low stock parts" });
    }
  });

  app.post('/api/shops/:shopId/parts', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const partData = insertPartSchema.parse({ ...req.body, shopId });
      const part = await storage.createPart(partData);
      res.json(part);
    } catch (error) {
      console.error("Error creating part:", error);
      res.status(500).json({ message: "Failed to create part" });
    }
  });

  // Vendor routes
  app.get('/api/shops/:shopId/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const vendors = await storage.getVendors(shopId);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/shops/:shopId/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const userShopRole = await storage.getUserShopRole(userId, shopId);
      if (!userShopRole) {
        return res.status(403).json({ message: "Access denied to this shop" });
      }
      
      const vendorData = insertVendorSchema.parse({ ...req.body, shopId });
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
