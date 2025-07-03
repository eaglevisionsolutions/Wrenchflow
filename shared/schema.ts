import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  decimal,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shops table for multi-tenant architecture
export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).notNull().default("trial"),
  billingEmail: varchar("billing_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }).default("75.00"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("8.5"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shop users junction table (users can belong to multiple shops)
export const shopUsers = pgTable(
  "shop_users",
  {
    userId: varchar("user_id").notNull().references(() => users.id),
    shopId: uuid("shop_id").notNull().references(() => shops.id),
    role: varchar("role", { length: 50 }).notNull().default("technician"), // admin, technician
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.shopId] }),
  })
);

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  unitType: varchar("unit_type", { length: 50 }).notNull(), // Snowblower, Lawnmower, Chainsaw, ATV
  make: varchar("make", { length: 100 }).notNull(),
  modelNumber: varchar("model_number", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work orders table
export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, in_progress, ready_for_pickup, completed, canceled
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // normal, high, urgent
  reportedProblem: text("reported_problem").notNull(),
  diagnosis: text("diagnosis"),
  repairNotes: text("repair_notes"),
  technicianId: varchar("technician_id").references(() => users.id),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }).default("0"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0"),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parts inventory table
export const parts = pgTable("parts", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  partName: varchar("part_name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  description: text("description"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  minimumStockLevel: integer("minimum_stock_level").default(0),
  binLocation: varchar("bin_location", { length: 50 }),
  isBulk: boolean("is_bulk").default(false),
  bulkUnitMeasure: varchar("bulk_unit_measure", { length: 20 }), // Litre, ml, Gallon, Quart
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work order parts junction table
export const workOrderParts = pgTable("work_order_parts", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id").notNull().references(() => workOrders.id),
  partId: uuid("part_id").notNull().references(() => parts.id),
  quantityUsed: integer("quantity_used").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").notNull().references(() => shops.id),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shopUsers: many(shopUsers),
}));

export const shopsRelations = relations(shops, ({ many }) => ({
  shopUsers: many(shopUsers),
  customers: many(customers),
  equipment: many(equipment),
  workOrders: many(workOrders),
  parts: many(parts),
  vendors: many(vendors),
}));

export const shopUsersRelations = relations(shopUsers, ({ one }) => ({
  user: one(users, {
    fields: [shopUsers.userId],
    references: [users.id],
  }),
  shop: one(shops, {
    fields: [shopUsers.shopId],
    references: [shops.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  shop: one(shops, {
    fields: [customers.shopId],
    references: [shops.id],
  }),
  equipment: many(equipment),
  workOrders: many(workOrders),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  shop: one(shops, {
    fields: [equipment.shopId],
    references: [shops.id],
  }),
  customer: one(customers, {
    fields: [equipment.customerId],
    references: [customers.id],
  }),
  workOrders: many(workOrders),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  shop: one(shops, {
    fields: [workOrders.shopId],
    references: [shops.id],
  }),
  equipment: one(equipment, {
    fields: [workOrders.equipmentId],
    references: [equipment.id],
  }),
  customer: one(customers, {
    fields: [workOrders.customerId],
    references: [customers.id],
  }),
  technician: one(users, {
    fields: [workOrders.technicianId],
    references: [users.id],
  }),
  workOrderParts: many(workOrderParts),
}));

export const partsRelations = relations(parts, ({ one, many }) => ({
  shop: one(shops, {
    fields: [parts.shopId],
    references: [shops.id],
  }),
  workOrderParts: many(workOrderParts),
}));

export const workOrderPartsRelations = relations(workOrderParts, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderParts.workOrderId],
    references: [workOrders.id],
  }),
  part: one(parts, {
    fields: [workOrderParts.partId],
    references: [parts.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  shop: one(shops, {
    fields: [vendors.shopId],
    references: [shops.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartSchema = createInsertSchema(parts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type WorkOrderPart = typeof workOrderParts.$inferSelect;
export type ShopUser = typeof shopUsers.$inferSelect;
