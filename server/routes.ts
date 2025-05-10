import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertInvoiceSchema, 
  insertExpenseSchema, 
  insertDocumentSchema,
  insertNotificationSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename with original extension
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non pris en charge. Veuillez télécharger un PDF, JPG ou PNG.'));
    }
  }
});

// Helper to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Authentification requise" });
};

// Helper to check if user is an accountant
const isAccountant = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.role === 'accountant') {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Transactions API
  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Invoices API
  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByUserId(req.user.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/invoices/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const invoice = await storage.getInvoiceById(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }
      
      if (invoice.userId !== req.user.id && req.user.role !== 'accountant') {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(parseInt(id), status);
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Expenses API
  app.post("/api/expenses", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      let fileUrl = undefined;
      let fileName = undefined;
      
      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
      }
      
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        userId: req.user.id,
        fileUrl,
        fileName,
        amount: parseInt(req.body.amount),
        status: 'pending'
      });
      
      const expense = await storage.createExpense(validatedData);
      
      // Create notification for accountant
      await storage.createNotification({
        userId: 1, // Accountant ID (assuming ID 1 for first user which is accountant)
        title: "Nouvelle dépense",
        message: `${req.user.fullName} a ajouté une nouvelle facture d'achat`,
        read: false,
        link: `/expenses/${expense.id}`
      });
      
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const expenses = await storage.getExpensesByUserId(req.user.id);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/expenses/:id/status", isAccountant, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const expense = await storage.getExpenseById(parseInt(id));
      if (!expense) {
        return res.status(404).json({ message: "Dépense non trouvée" });
      }
      
      const updatedExpense = await storage.updateExpenseStatus(
        parseInt(id), 
        status, 
        req.user.id
      );
      
      // Create notification for client
      await storage.createNotification({
        userId: expense.userId,
        title: "Statut de dépense mis à jour",
        message: `Votre facture d'achat a été ${status === 'processed' ? 'validée' : 'rejetée'}`,
        read: false,
        link: `/expenses/${expense.id}`
      });
      
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Documents API
  app.post("/api/documents", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Le fichier est requis" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileName = req.file.originalname;
      
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId: req.user.id,
        fileUrl,
        fileName,
        status: 'pending'
      });
      
      const document = await storage.createDocument(validatedData);
      
      // Create notification for accountant
      await storage.createNotification({
        userId: 1, // Accountant ID
        title: "Nouveau document",
        message: `${req.user.fullName} a ajouté un nouveau document`,
        read: false,
        link: `/documents/${document.id}`
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.user.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/documents/:id/status", isAccountant, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const document = await storage.getDocumentById(parseInt(id));
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }
      
      const updatedDocument = await storage.updateDocumentStatus(
        parseInt(id), 
        status, 
        req.user.id
      );
      
      // Create notification for client
      await storage.createNotification({
        userId: document.userId,
        title: "Statut de document mis à jour",
        message: `Votre document a été ${status === 'processed' ? 'traité' : 'rejeté'}`,
        read: false,
        link: `/documents/${document.id}`
      });
      
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Notifications API
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await storage.markNotificationAsRead(parseInt(id));
      if (!notification) {
        return res.status(404).json({ message: "Notification non trouvée" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Accountant-specific APIs
  app.get("/api/clients", isAccountant, async (req, res) => {
    try {
      const clients = await storage.getClientUsers();
      // Remove passwords before sending
      const clientsWithoutPasswords = clients.map(client => {
        const { password, ...clientWithoutPassword } = client;
        return clientWithoutPassword;
      });
      res.json(clientsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/pending-documents", isAccountant, async (req, res) => {
    try {
      const documents = await storage.getUnprocessedDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', isAuthenticated, (req, res, next) => {
    express.static(uploadsDir)(req, res, next);
  });

  const httpServer = createServer(app);
  return httpServer;
}
