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

const db = new Database("resume_system.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS job_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS screenings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    job_id INTEGER NOT NULL,
    analysis_json TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_requirements (id)
  );
`);

const app = express();
app.use(express.json());

const PORT = 3000;

// API Routes
app.post("/api/jobs", (req, res) => {
  const { title, description } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO job_requirements (title, description) VALUES (?, ?)");
    const info = stmt.run(title, description);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: "Failed to save job requirement" });
  }
});

app.get("/api/jobs", (req, res) => {
  const jobs = db.prepare("SELECT * FROM job_requirements ORDER BY created_at DESC").all();
  res.json(jobs);
});

app.post("/api/screenings", (req, res) => {
  const { candidateName, resumeText, jobId, analysis } = req.body;
  try {
    const stmt = db.prepare(
      "INSERT INTO screenings (candidate_name, resume_text, job_id, analysis_json) VALUES (?, ?, ?, ?)"
    );
    stmt.run(candidateName, resumeText, jobId, JSON.stringify(analysis));
    res.status(201).json({ message: "Screening saved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save screening" });
  }
});

app.get("/api/screenings", (req, res) => {
  const screenings = db.prepare(`
    SELECT s.*, j.title as job_title 
    FROM screenings s 
    JOIN job_requirements j ON s.job_id = j.id 
    ORDER BY s.timestamp DESC
  `).all();
  res.json(screenings.map((s: any) => ({
    ...s,
    analysis: JSON.parse(s.analysis_json)
  })));
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
