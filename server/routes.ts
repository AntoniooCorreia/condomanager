import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.status(200).json({ message: "Logged out" });
  });

  app.get(api.auth.me.path, (req, res) => {
    // For mocked auth, we will let client handle it
    res.status(401).json({ message: "Not implemented in mock" });
  });

  // Users
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });
  
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      if (!input.username || !input.password || !input.name || !input.unit) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: "Erro ao criar utilizador" });
    }
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const updated = await storage.updateUser(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Não encontrado" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.status(204).end();
  });
  
  app.delete('/api/works/:id', async (req, res) => {
    await storage.deleteWork(Number(req.params.id));
    res.status(204).end();
  });

  app.get(api.payments.list.path, async (req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });
  app.post(api.payments.create.path, async (req, res) => {
    try {
      const bodySchema = api.payments.create.input.extend({
        amount: z.coerce.string(),
        userId: z.coerce.number(),
        dueDate: z.coerce.date()
      });
      const input = bodySchema.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      res.status(400).json({ message: "Erro ao criar aviso de pagamento" });
    }
  });
  app.put(api.payments.update.path, async (req, res) => {
    try {
      const input = api.payments.update.input.parse(req.body);
      const updated = await storage.updatePayment(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });

  app.delete('/api/payments/:id', async (req, res) => {
    await storage.deletePayment(Number(req.params.id));
    res.status(204).end();
  });

  // Payment Schedules
  app.get('/api/payment-schedules', async (req, res) => {
    const schedules = await storage.getPaymentSchedules();
    res.json(schedules);
  });
  app.post('/api/payment-schedules', async (req, res) => {
    try {
      const bodySchema = z.object({
        condominoId: z.coerce.number(),
        tenantId: z.coerce.number(),
        dayOfMonth: z.coerce.number().min(1).max(28),
        amount: z.coerce.string(),
        description: z.string(),
        active: z.boolean().optional().default(true),
      });
      const input = bodySchema.parse(req.body);
      const schedule = await storage.createPaymentSchedule(input);
      res.status(201).json(schedule);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(400).json({ message: "Erro ao criar agendamento" });
    }
  });
  app.delete('/api/payment-schedules/:id', async (req, res) => {
    await storage.deletePaymentSchedule(Number(req.params.id));
    res.status(204).end();
  });

  // Works
  app.get(api.works.list.path, async (req, res) => {
    const w = await storage.getWorks();
    res.json(w);
  });
  app.post(api.works.create.path, async (req, res) => {
    try {
      const bodySchema = api.works.create.input.extend({
        cost: z.coerce.string().optional(),
        assignedUserIds: z.array(z.number()).optional()
      });
      const input = bodySchema.parse(req.body);
      const w = await storage.createWork(input);
      res.status(201).json(w);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });
  app.put(api.works.update.path, async (req, res) => {
    try {
      const bodySchema = api.works.update.input.extend({
        cost: z.coerce.string().optional(),
        assignedUserIds: z.array(z.number()).optional()
      });
      const input = bodySchema.parse(req.body);
      const updated = await storage.updateWork(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });

  // Reservations
  app.get(api.reservations.list.path, async (req, res) => {
    const r = await storage.getReservations();
    res.json(r);
  });
  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const input = api.reservations.create.input.extend({
        date: z.coerce.date()
      }).parse(req.body);
      const r = await storage.createReservation(input);
      res.status(201).json(r);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });
  app.put(api.reservations.update.path, async (req, res) => {
    try {
      const input = api.reservations.update.input.extend({
        date: z.coerce.date().optional()
      }).parse(req.body);
      const updated = await storage.updateReservation(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });

  // Security Logs
  app.get(api.securityLogs.list.path, async (req, res) => {
    const s = await storage.getSecurityLogs();
    res.json(s);
  });
  app.post(api.securityLogs.create.path, async (req, res) => {
    try {
      const input = api.securityLogs.create.input.parse(req.body);
      const s = await storage.createSecurityLog(input);
      res.status(201).json(s);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });
  app.put(api.securityLogs.update.path, async (req, res) => {
    try {
      const input = api.securityLogs.update.input.parse(req.body);
      const updated = await storage.updateSecurityLog(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    }
  });

  // seeddb if empty
  setTimeout(async () => {
    try {
      const users = await storage.getUsers();
      if (users.length === 0) {
        const admin = await storage.createUser({ username: 'admin', password: 'password', role: 'admin', name: 'Administrador', unit: null });
        const user = await storage.createUser({ username: 'user', password: 'password', role: 'user', name: 'João Silva', unit: '101A' });
        
        await storage.createPayment({ userId: user.id, amount: "150.00", status: "pending", dueDate: new Date(Date.now() + 86400000 * 5), description: "Condomínio Maio" });
        await storage.createPayment({ userId: user.id, amount: "150.00", status: "paid", dueDate: new Date(Date.now() - 86400000 * 25), description: "Condomínio Abril" });
        
        await storage.createWork({ title: "Pintura Fachada", description: "Pintura da fachada do prédio bloco B", status: "in_progress", startDate: new Date(), cost: "5000.00" });
        
        await storage.createReservation({ userId: user.id, area: "pool", date: new Date(Date.now() + 86400000 * 2), status: "approved" });
        
        await storage.createSecurityLog({ reportedBy: user.id, description: "Porta da garagem não fecha", status: "resolved" });
      }
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }, 1000);

  return httpServer;
}
