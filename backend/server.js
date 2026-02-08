import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { CaseSchema } from "./src/lib/validateCase.js";
import { registerMetricsRoutes } from "./src/routes/metrics.routes.js";
import { registerFeaturedRoutes } from "./src/routes/featured.routes.js";
import { registerSeedRoutes } from "./src/routes/seed.routes.js";
import { registerAiRoutes } from "./src/routes/ai.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";


app.use("/api/ai", aiRoutes);

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(helmet());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

// ------- DB (JSON) -------
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const file = path.join(dataDir, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [], cases: [], subscriptions: [] });

async function initDB() {
  await db.read();
  db.data ||= { users: [], cases: [], subscriptions: [] };

  const ensureUser = (email, password, role) => {
    const exists = db.data.users.find((u) => u.email === email);
    if (!exists) {
      db.data.users.push({
        id: nanoid(),
        email,
        password: bcrypt.hashSync(password, 10),
        role,
      });
    }
  };

  // Seeds (tu peux changer les mdp)
  ensureUser("admin@solicare.tn", "admin123", "ADMIN");
  ensureUser("association@solicare.tn", "assoc123", "ASSOCIATION");
  ensureUser("donor@solicare.tn", "donor123", "DONOR");

  // Seed demo cases if DB empty (for jury / hackathon demo)
  if (!db.data.cases || db.data.cases.length === 0) {
    db.data.cases = [
      {
        id: nanoid(),
        title: "Médicaments urgents – traitement 1 mois",
        summary: "Traitement médical urgent pour un patient en situation précaire.",
        description: "Financement de médicaments nécessaires pour un mois de traitement. L’objectif est d’éviter une complication et de stabiliser l’état de santé.",
        category: "Santé",
        urgency: "TRES_URGENT",
        cha9a9aUrl: "https://cha9a9a.tn/don/traitement-urgent",
        photos: ["https://images.unsplash.com/photo-1580281658628-3a7e7b6cc7a3?auto=format&fit=crop&w=1200&q=60"],
        goalAmount: 1200,
        raisedAmount: 480,
        donationsCount: 7,
        status: "APPROVED",
        featured: true,
        ownerEmail: "association@solicare.tn",
        locationText: "Ariana, Tunisie",
        lat: 36.8665,
        lng: 10.1647,
        createdAt: new Date().toISOString(),
        views: 83
      },
      {
        id: nanoid(),
        title: "Fauteuil roulant pour Amal (Ariana)",
        summary: "Achat d’un fauteuil roulant adapté + séances de rééducation.",
        description: "Amal a besoin d’un fauteuil roulant adapté et de séances de rééducation. Votre don aidera à améliorer sa mobilité et son autonomie.",
        category: "Handicap",
        urgency: "URGENT",
        cha9a9aUrl: "https://cha9a9a.tn/don/amal-fauteuil",
        photos: ["https://images.unsplash.com/photo-1580281657525-5f1b0d1d0002?auto=format&fit=crop&w=1200&q=60"],
        goalAmount: 2000,
        raisedAmount: 950,
        donationsCount: 12,
        status: "APPROVED",
        featured: true,
        ownerEmail: "association@solicare.tn",
        locationText: "Ariana, Tunisie",
        lat: 36.8665,
        lng: 10.1647,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        views: 45
      }
    ];
  }

  await db.write();
}

// ------- Auth middleware -------
const auth = (roles = []) => (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = h.split(" ")[1];
    const d = jwt.verify(token, JWT_SECRET);
    if (roles.length && !roles.includes(d.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = d;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

// ------- Routes -------
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  await db.read();
  const { email, password } = req.body;

  const u = db.data.users.find((x) => x.email === email);
  if (!u || !bcrypt.compareSync(password, u.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, JWT_SECRET);
  res.json({ token, user: { id: u.id, email: u.email, role: u.role } });
});

// Public cases (APPROVED)
app.get("/api/cases", async (req, res) => {
  await db.read();

  const { category, urgency, q, sort = "date", page = "1", limit = "12" } = req.query;

  let items = (db.data.cases || []).filter((c) => c.status === "APPROVED");

  if (category) items = items.filter((c) => c.category === category);
  if (urgency) items = items.filter((c) => c.urgency === urgency);
  if (q) {
    const s = String(q).toLowerCase();
    items = items.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(s) ||
        (c.summary || "").toLowerCase().includes(s) ||
        (c.description || "").toLowerCase().includes(s) ||
        (c.locationText || c.address || "").toLowerCase().includes(s)
    );
  }

  const rank = (u) => (u === "TRES_URGENT" ? 3 : u === "URGENT" ? 2 : 1);

  if (sort === "urgency") {
    items.sort((a, b) => rank(b.urgency) - rank(a.urgency) || (b.createdAt || "").localeCompare(a.createdAt || ""));
  } else if (sort === "views") {
    items.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  const pNum = Math.max(1, parseInt(page, 10) || 1);
  const lNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const total = items.length;
  const start = (pNum - 1) * lNum;
  const paged = items.slice(start, start + lNum);

  res.json({ items: paged, meta: { total, page: pNum, limit: lNum } });
});

app.get("/api/cases/:id", async (req, res) => {
  await db.read();
  const c = db.data.cases.find((x) => x.id === req.params.id);
  if (!c || c.status === "REJECTED") return res.status(404).json({ message: "Not found" });
  res.json(c);
});

app.post("/api/cases/:id/view", async (req, res) => {
  await db.read();
  const c = db.data.cases.find((x) => x.id === req.params.id);
  if (c) {
    c.views = (c.views || 0) + 1;
    await db.write();
  }
  res.json({ ok: true });
});

// Create case (ASSOCIATION)
app.post("/api/cases", auth(["ASSOCIATION"]), async (req, res) => {
  const parsed = CaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }

  await db.read();
  db.data.cases ||= [];

  const c = parsed.data;

  const newCase = {
    id: nanoid(),
    ownerEmail: req.user.email,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    views: 0,
    donationsCount: 0,
    featured: false,
    ...c
  };

  db.data.cases.push(newCase);
  await db.write();
  res.status(201).json({ ok: true, item: newCase });
});


// Association dashboard
app.get("/api/association/cases", auth(["ASSOCIATION"]), async (req, res) => {
  await db.read();
  const items = db.data.cases.filter((c) => c.ownerEmail === req.user.email);
  res.json({ items });
});

// Admin list cases
app.get("/api/admin/cases", auth(["ADMIN"]), async (req, res) => {
  await db.read();
  const { status } = req.query;
  let items = db.data.cases;
  if (status) items = items.filter((c) => c.status === status);
  res.json({ items });
});

// Admin update status
app.patch("/api/admin/cases/:id/status", auth(["ADMIN"]), async (req, res) => {
  await db.read();
  const c = db.data.cases.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });

  const { status } = req.body;
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  c.status = status;
  await db.write();
  res.json({ ok: true, item: c });
});

// Admin stats
app.get("/api/admin/stats", auth(["ADMIN"]), async (req, res) => {
  await db.read();
  const count = (s) => db.data.cases.filter((c) => c.status === s).length;
  res.json({
    approved: count("APPROVED"),
    pending: count("PENDING"),
    rejected: count("REJECTED"),
  });
});

// subscriptions urgent
app.post("/api/subscriptions/urgent", async (req, res) => {
  await db.read();
  const { email, subscribed } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });

  const ex = db.data.subscriptions.find((x) => x.email === email);
  if (ex) ex.urgent = !!subscribed;
  else db.data.subscriptions.push({ email, urgent: !!subscribed });

  await db.write();
  res.json({ ok: true });
});


// Extra routes (dashboards, AI, seeding)
registerFeaturedRoutes(app, { auth, db });
registerMetricsRoutes(app, { auth, db });
registerSeedRoutes(app, { auth, db });
registerAiRoutes(app, { db, auth });

// Start
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend ready on http://localhost:${PORT}`);
    console.log(`📁 DB file: ${file}`);
  });
});
registerFeaturedRoutes(app, { auth, db });
registerMetricsRoutes(app, { auth, db });
registerSeedRoutes(app, { auth, db });
registerAiRoutes(app, { db, auth });