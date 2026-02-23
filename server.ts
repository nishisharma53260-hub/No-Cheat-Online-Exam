import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("startup_evaluator.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startup_name TEXT NOT NULL,
    proposal_text TEXT NOT NULL,
    analysis_json TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json());

const PORT = 3000;

// API Routes
app.post("/api/evaluations", (req, res) => {
  const { startupName, proposalText, analysis } = req.body;
  try {
    const stmt = db.prepare(
      "INSERT INTO evaluations (startup_name, proposal_text, analysis_json) VALUES (?, ?, ?)"
    );
    const info = stmt.run(startupName, proposalText, JSON.stringify(analysis));
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save evaluation" });
  }
});

app.get("/api/evaluations", (req, res) => {
  try {
    const records = db.prepare("SELECT * FROM evaluations ORDER BY timestamp DESC").all();
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
});

app.get("/api/evaluations/:id", (req, res) => {
  const { id } = req.params;
  try {
    const record = db.prepare("SELECT * FROM evaluations WHERE id = ?").get(id) as any;
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json({
      ...record,
      analysis: JSON.parse(record.analysis_json)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch evaluation" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
