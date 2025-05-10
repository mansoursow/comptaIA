import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // 'client' or 'accountant'
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Insert schema for User
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Cash register transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: integer("amount").notNull(), // Store in cents
  category: text("category").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Insert schema for Transaction
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  invoiceNumber: text("invoice_number").notNull(),
  clientName: text("client_name").notNull(),
  amount: integer("amount").notNull(), // Store in cents
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(), // 'draft', 'sent', 'paid', 'overdue'
  items: json("items").notNull(), // Array of line items
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Insert schema for Invoice
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

// Line item schema for invoices
export const invoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(), // in cents
  total: z.number().positive(), // in cents
});

// Expense schema for purchase invoices
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(), // Store in cents
  supplierName: text("supplier_name").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  status: text("status").notNull(), // 'pending', 'processed', 'rejected'
  notes: text("notes"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
});

// Create Insert schema for Expense
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  reviewedBy: true,
  reviewedAt: true,
});

// Document schema for general document types
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'invoice', 'receipt', 'bank_statement', etc.
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  status: text("status").notNull(), // 'pending', 'processed', 'rejected'
  notes: text("notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
});

// Create Insert schema for Document
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
  reviewedBy: true,
  reviewedAt: true,
});

// Notification schema for client-accountant communications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  link: text("link"),
});

// Create Insert schema for Notification
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
