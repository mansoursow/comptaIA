import {
  users, transactions, invoices, expenses, documents, notifications,
  type User, type InsertUser, type Transaction, type InsertTransaction,
  type Invoice, type InsertInvoice, type Expense, type InsertExpense,
  type Document, type InsertDocument, type Notification, type InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  updateExpenseStatus(id: number, status: string, reviewedBy: number): Promise<Expense | undefined>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  updateDocumentStatus(id: number, status: string, reviewedBy: number): Promise<Document | undefined>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Client operations for accountant
  getClientUsers(): Promise<User[]>;
  getUnprocessedDocuments(): Promise<Document[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private transactionsMap: Map<number, Transaction>;
  private invoicesMap: Map<number, Invoice>;
  private expensesMap: Map<number, Expense>;
  private documentsMap: Map<number, Document>;
  private notificationsMap: Map<number, Notification>;
  
  public sessionStore: session.SessionStore;
  
  private nextId: {
    users: number;
    transactions: number;
    invoices: number;
    expenses: number;
    documents: number;
    notifications: number;
  };

  constructor() {
    this.usersMap = new Map();
    this.transactionsMap = new Map();
    this.invoicesMap = new Map();
    this.expensesMap = new Map();
    this.documentsMap = new Map();
    this.notificationsMap = new Map();
    
    this.nextId = {
      users: 1,
      transactions: 1,
      invoices: 1,
      expenses: 1,
      documents: 1,
      notifications: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create initial accountant user
    this.createUser({
      username: "accountant",
      password: "accountant123", // In real app, this would be hashed
      email: "accountant@example.com",
      fullName: "Comptable Admin",
      role: "accountant",
      profileImageUrl: undefined
    });
    
    // Create initial client user
    this.createUser({
      username: "client",
      password: "client123", // In real app, this would be hashed
      email: "client@example.com",
      fullName: "Jean Dupont",
      role: "client",
      profileImageUrl: undefined
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId.users++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextId.transactions++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now
    };
    this.transactionsMap.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactionsMap.get(id);
  }

  // Invoice operations
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.nextId.invoices++;
    const now = new Date();
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: now
    };
    this.invoicesMap.set(id, invoice);
    return invoice;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoicesMap.values())
      .filter(invoice => invoice.userId === userId)
      .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoicesMap.get(id);
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const invoice = this.invoicesMap.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...invoice,
      status
    };
    this.invoicesMap.set(id, updatedInvoice);
    return updatedInvoice;
  }

  // Expense operations
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.nextId.expenses++;
    const now = new Date();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: now,
      reviewedBy: null,
      reviewedAt: null
    };
    this.expensesMap.set(id, expense);
    return expense;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expensesMap.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expensesMap.get(id);
  }

  async updateExpenseStatus(id: number, status: string, reviewedBy: number): Promise<Expense | undefined> {
    const expense = this.expensesMap.get(id);
    if (!expense) return undefined;
    
    const now = new Date();
    const updatedExpense: Expense = {
      ...expense,
      status,
      reviewedBy,
      reviewedAt: now
    };
    this.expensesMap.set(id, updatedExpense);
    return updatedExpense;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.nextId.documents++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      uploadDate: now,
      reviewedBy: null,
      reviewedAt: null
    };
    this.documentsMap.set(id, document);
    return document;
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documentsMap.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documentsMap.get(id);
  }

  async updateDocumentStatus(id: number, status: string, reviewedBy: number): Promise<Document | undefined> {
    const document = this.documentsMap.get(id);
    if (!document) return undefined;
    
    const now = new Date();
    const updatedDocument: Document = {
      ...document,
      status,
      reviewedBy,
      reviewedAt: now
    };
    this.documentsMap.set(id, updatedDocument);
    return updatedDocument;
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.nextId.notifications++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now
    };
    this.notificationsMap.set(id, notification);
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notificationsMap.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = {
      ...notification,
      read: true
    };
    this.notificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }

  // Client operations for accountant
  async getClientUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values())
      .filter(user => user.role === 'client')
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async getUnprocessedDocuments(): Promise<Document[]> {
    return Array.from(this.documentsMap.values())
      .filter(doc => doc.status === 'pending')
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }
}

export const storage = new MemStorage();
