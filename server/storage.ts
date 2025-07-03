import {
  users,
  shops,
  shopUsers,
  customers,
  equipment,
  workOrders,
  parts,
  workOrderParts,
  vendors,
  type User,
  type UpsertUser,
  type Shop,
  type InsertShop,
  type Customer,
  type InsertCustomer,
  type Equipment,
  type InsertEquipment,
  type WorkOrder,
  type InsertWorkOrder,
  type Part,
  type InsertPart,
  type Vendor,
  type InsertVendor,
  type WorkOrderPart,
  type ShopUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Shop operations
  createShop(shop: InsertShop): Promise<Shop>;
  getShop(shopId: string): Promise<Shop | undefined>;
  getUserShops(userId: string): Promise<Shop[]>;
  addUserToShop(userId: string, shopId: string, role: string): Promise<void>;
  getUserShopRole(userId: string, shopId: string): Promise<ShopUser | undefined>;
  
  // Customer operations
  getCustomers(shopId: string): Promise<Customer[]>;
  getCustomer(shopId: string, customerId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(shopId: string, customerId: string, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(shopId: string, customerId: string): Promise<void>;
  
  // Equipment operations
  getEquipment(shopId: string): Promise<(Equipment & { customer: Customer })[]>;
  getEquipmentByCustomer(shopId: string, customerId: string): Promise<Equipment[]>;
  getEquipmentItem(shopId: string, equipmentId: string): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(shopId: string, equipmentId: string, updates: Partial<InsertEquipment>): Promise<Equipment>;
  deleteEquipment(shopId: string, equipmentId: string): Promise<void>;
  
  // Work order operations
  getWorkOrders(shopId: string): Promise<(WorkOrder & { customer: Customer; equipment: Equipment; technician?: User })[]>;
  getWorkOrder(shopId: string, workOrderId: string): Promise<(WorkOrder & { customer: Customer; equipment: Equipment; technician?: User }) | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(shopId: string, workOrderId: string, updates: Partial<InsertWorkOrder>): Promise<WorkOrder>;
  deleteWorkOrder(shopId: string, workOrderId: string): Promise<void>;
  getWorkOrdersByStatus(shopId: string, status: string): Promise<WorkOrder[]>;
  
  // Parts operations
  getParts(shopId: string): Promise<Part[]>;
  getPart(shopId: string, partId: string): Promise<Part | undefined>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(shopId: string, partId: string, updates: Partial<InsertPart>): Promise<Part>;
  deletePart(shopId: string, partId: string): Promise<void>;
  getLowStockParts(shopId: string): Promise<Part[]>;
  
  // Vendor operations
  getVendors(shopId: string): Promise<Vendor[]>;
  getVendor(shopId: string, vendorId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(shopId: string, vendorId: string, updates: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(shopId: string, vendorId: string): Promise<void>;
  
  // Dashboard metrics
  getDashboardMetrics(shopId: string): Promise<{
    activeWorkOrders: number;
    monthlyRevenue: string;
    totalCustomers: number;
    lowStockItems: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Shop operations
  async createShop(shop: InsertShop): Promise<Shop> {
    const [newShop] = await db.insert(shops).values(shop).returning();
    return newShop;
  }

  async getShop(shopId: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, shopId));
    return shop;
  }

  async getUserShops(userId: string): Promise<Shop[]> {
    const userShops = await db
      .select({ shop: shops })
      .from(shopUsers)
      .innerJoin(shops, eq(shopUsers.shopId, shops.id))
      .where(eq(shopUsers.userId, userId));
    
    return userShops.map(row => row.shop);
  }

  async addUserToShop(userId: string, shopId: string, role: string): Promise<void> {
    await db.insert(shopUsers).values({ userId, shopId, role });
  }

  async getUserShopRole(userId: string, shopId: string): Promise<ShopUser | undefined> {
    const [shopUser] = await db
      .select()
      .from(shopUsers)
      .where(and(eq(shopUsers.userId, userId), eq(shopUsers.shopId, shopId)));
    return shopUser;
  }

  // Customer operations
  async getCustomers(shopId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.shopId, shopId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(shopId: string, customerId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.shopId, shopId), eq(customers.id, customerId)));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(shopId: string, customerId: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(customers.shopId, shopId), eq(customers.id, customerId)))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(shopId: string, customerId: string): Promise<void> {
    await db
      .delete(customers)
      .where(and(eq(customers.shopId, shopId), eq(customers.id, customerId)));
  }

  // Equipment operations
  async getEquipment(shopId: string): Promise<(Equipment & { customer: Customer })[]> {
    return await db
      .select({
        id: equipment.id,
        shopId: equipment.shopId,
        customerId: equipment.customerId,
        unitType: equipment.unitType,
        make: equipment.make,
        modelNumber: equipment.modelNumber,
        serialNumber: equipment.serialNumber,
        purchaseDate: equipment.purchaseDate,
        notes: equipment.notes,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
        customer: customers,
      })
      .from(equipment)
      .innerJoin(customers, eq(equipment.customerId, customers.id))
      .where(eq(equipment.shopId, shopId))
      .orderBy(desc(equipment.createdAt));
  }

  async getEquipmentByCustomer(shopId: string, customerId: string): Promise<Equipment[]> {
    return await db
      .select()
      .from(equipment)
      .where(and(eq(equipment.shopId, shopId), eq(equipment.customerId, customerId)))
      .orderBy(desc(equipment.createdAt));
  }

  async getEquipmentItem(shopId: string, equipmentId: string): Promise<Equipment | undefined> {
    const [item] = await db
      .select()
      .from(equipment)
      .where(and(eq(equipment.shopId, shopId), eq(equipment.id, equipmentId)));
    return item;
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning();
    return newEquipment;
  }

  async updateEquipment(shopId: string, equipmentId: string, updates: Partial<InsertEquipment>): Promise<Equipment> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(equipment.shopId, shopId), eq(equipment.id, equipmentId)))
      .returning();
    return updatedEquipment;
  }

  async deleteEquipment(shopId: string, equipmentId: string): Promise<void> {
    await db
      .delete(equipment)
      .where(and(eq(equipment.shopId, shopId), eq(equipment.id, equipmentId)));
  }

  // Work order operations
  async getWorkOrders(shopId: string): Promise<(WorkOrder & { customer: Customer; equipment: Equipment; technician?: User })[]> {
    return await db
      .select({
        id: workOrders.id,
        shopId: workOrders.shopId,
        equipmentId: workOrders.equipmentId,
        customerId: workOrders.customerId,
        orderNumber: workOrders.orderNumber,
        status: workOrders.status,
        priority: workOrders.priority,
        reportedProblem: workOrders.reportedProblem,
        diagnosis: workOrders.diagnosis,
        repairNotes: workOrders.repairNotes,
        technicianId: workOrders.technicianId,
        laborHours: workOrders.laborHours,
        laborCost: workOrders.laborCost,
        partsCost: workOrders.partsCost,
        totalCost: workOrders.totalCost,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
        customer: customers,
        equipment: equipment,
        technician: users,
      })
      .from(workOrders)
      .innerJoin(customers, eq(workOrders.customerId, customers.id))
      .innerJoin(equipment, eq(workOrders.equipmentId, equipment.id))
      .leftJoin(users, eq(workOrders.technicianId, users.id))
      .where(eq(workOrders.shopId, shopId))
      .orderBy(desc(workOrders.createdAt));
  }

  async getWorkOrder(shopId: string, workOrderId: string): Promise<(WorkOrder & { customer: Customer; equipment: Equipment; technician?: User }) | undefined> {
    const [order] = await db
      .select({
        id: workOrders.id,
        shopId: workOrders.shopId,
        equipmentId: workOrders.equipmentId,
        customerId: workOrders.customerId,
        orderNumber: workOrders.orderNumber,
        status: workOrders.status,
        priority: workOrders.priority,
        reportedProblem: workOrders.reportedProblem,
        diagnosis: workOrders.diagnosis,
        repairNotes: workOrders.repairNotes,
        technicianId: workOrders.technicianId,
        laborHours: workOrders.laborHours,
        laborCost: workOrders.laborCost,
        partsCost: workOrders.partsCost,
        totalCost: workOrders.totalCost,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
        customer: customers,
        equipment: equipment,
        technician: users,
      })
      .from(workOrders)
      .innerJoin(customers, eq(workOrders.customerId, customers.id))
      .innerJoin(equipment, eq(workOrders.equipmentId, equipment.id))
      .leftJoin(users, eq(workOrders.technicianId, users.id))
      .where(and(eq(workOrders.shopId, shopId), eq(workOrders.id, workOrderId)));
    return order;
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [newWorkOrder] = await db.insert(workOrders).values(workOrder).returning();
    return newWorkOrder;
  }

  async updateWorkOrder(shopId: string, workOrderId: string, updates: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(workOrders.shopId, shopId), eq(workOrders.id, workOrderId)))
      .returning();
    return updatedWorkOrder;
  }

  async deleteWorkOrder(shopId: string, workOrderId: string): Promise<void> {
    await db
      .delete(workOrders)
      .where(and(eq(workOrders.shopId, shopId), eq(workOrders.id, workOrderId)));
  }

  async getWorkOrdersByStatus(shopId: string, status: string): Promise<WorkOrder[]> {
    return await db
      .select()
      .from(workOrders)
      .where(and(eq(workOrders.shopId, shopId), eq(workOrders.status, status)))
      .orderBy(desc(workOrders.createdAt));
  }

  // Parts operations
  async getParts(shopId: string): Promise<Part[]> {
    return await db
      .select()
      .from(parts)
      .where(eq(parts.shopId, shopId))
      .orderBy(parts.partName);
  }

  async getPart(shopId: string, partId: string): Promise<Part | undefined> {
    const [part] = await db
      .select()
      .from(parts)
      .where(and(eq(parts.shopId, shopId), eq(parts.id, partId)));
    return part;
  }

  async createPart(part: InsertPart): Promise<Part> {
    const [newPart] = await db.insert(parts).values(part).returning();
    return newPart;
  }

  async updatePart(shopId: string, partId: string, updates: Partial<InsertPart>): Promise<Part> {
    const [updatedPart] = await db
      .update(parts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(parts.shopId, shopId), eq(parts.id, partId)))
      .returning();
    return updatedPart;
  }

  async deletePart(shopId: string, partId: string): Promise<void> {
    await db
      .delete(parts)
      .where(and(eq(parts.shopId, shopId), eq(parts.id, partId)));
  }

  async getLowStockParts(shopId: string): Promise<Part[]> {
    return await db
      .select()
      .from(parts)
      .where(
        and(
          eq(parts.shopId, shopId),
          sql`${parts.quantityOnHand} <= ${parts.minimumStockLevel}`
        )
      )
      .orderBy(parts.partName);
  }

  // Vendor operations
  async getVendors(shopId: string): Promise<Vendor[]> {
    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.shopId, shopId))
      .orderBy(vendors.vendorName);
  }

  async getVendor(shopId: string, vendorId: string): Promise<Vendor | undefined> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.shopId, shopId), eq(vendors.id, vendorId)));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(shopId: string, vendorId: string, updates: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(vendors.shopId, shopId), eq(vendors.id, vendorId)))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(shopId: string, vendorId: string): Promise<void> {
    await db
      .delete(vendors)
      .where(and(eq(vendors.shopId, shopId), eq(vendors.id, vendorId)));
  }

  // Dashboard metrics
  async getDashboardMetrics(shopId: string): Promise<{
    activeWorkOrders: number;
    monthlyRevenue: string;
    totalCustomers: number;
    lowStockItems: number;
  }> {
    const [activeWorkOrdersResult] = await db
      .select({ count: count() })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.shopId, shopId),
          sql`${workOrders.status} IN ('open', 'in_progress', 'ready_for_pickup')`
        )
      );

    const [monthlyRevenueResult] = await db
      .select({ revenue: sum(workOrders.totalCost) })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.shopId, shopId),
          sql`${workOrders.createdAt} >= date_trunc('month', current_date)`
        )
      );

    const [totalCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.shopId, shopId));

    const [lowStockItemsResult] = await db
      .select({ count: count() })
      .from(parts)
      .where(
        and(
          eq(parts.shopId, shopId),
          sql`${parts.quantityOnHand} <= ${parts.minimumStockLevel}`
        )
      );

    return {
      activeWorkOrders: activeWorkOrdersResult.count,
      monthlyRevenue: monthlyRevenueResult.revenue || "0",
      totalCustomers: totalCustomersResult.count,
      lowStockItems: lowStockItemsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();