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

const db = new Database("exam_system.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    questions TEXT NOT NULL,
    solution_key TEXT NOT NULL,
    examiner_email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams (id)
  );
`);

const app = express();
app.use(express.json());

const PORT = 3000;

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API Routes
app.post("/api/exams", (req, res) => {
  const { id, title, questions, solutionKey, examinerEmail } = req.body;
  try {
    const stmt = db.prepare(
      "INSERT INTO exams (id, title, questions, solution_key, examiner_email) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, title, JSON.stringify(questions), JSON.stringify(solutionKey), examinerEmail);
    res.status(201).json({ message: "Exam created successfully", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create exam" });
  }
});

app.get("/api/exams/:id", (req, res) => {
  const { id } = req.params;
  const exam = db.prepare("SELECT id, title, questions FROM exams WHERE id = ?").get(id) as any;
  if (!exam) {
    return res.status(404).json({ error: "Exam not found" });
  }
  res.json({
    ...exam,
    questions: JSON.parse(exam.questions),
  });
});

app.post("/api/exams/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { studentName, answers, status } = req.body;

  const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(id) as any;
  if (!exam) {
    return res.status(404).json({ error: "Exam not found" });
  }

  const questions = JSON.parse(exam.questions);
  const solutionKey = JSON.parse(exam.solution_key);
  
  let score = 0;
  const totalMarks = questions.length;

  // Evaluation
  questions.forEach((q: any, index: number) => {
    if (answers[index] === solutionKey[index]) {
      score++;
    }
  });

  try {
    // Save Result
    const stmt = db.prepare(
      "INSERT INTO results (exam_id, student_name, answers, score, total_marks, status) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(id, studentName, JSON.stringify(answers), score, totalMarks, status);

    // Send Email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: exam.examiner_email,
      subject: `Exam Result: ${exam.title} - ${studentName}`,
      text: `
        Exam: ${exam.title}
        Student Name: ${studentName}
        Status: ${status}
        Score: ${score} / ${totalMarks}
        
        Answers:
        ${questions.map((q: any, i: number) => `Q${i+1}: ${answers[i] || 'No Answer'} (Correct: ${solutionKey[i]})`).join('\n')}
      `,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log("Email not sent: SMTP credentials missing. Result logged to DB.");
    }

    res.json({ score, totalMarks, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

app.get("/api/exams/:id/results", (req, res) => {
  const { id } = req.params;
  const results = db.prepare("SELECT * FROM results WHERE exam_id = ? ORDER BY timestamp DESC").all(id);
  res.json(results.map((r: any) => ({
    ...r,
    answers: JSON.parse(r.answers)
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
