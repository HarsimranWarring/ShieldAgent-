import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { createRouter } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite
const dbPath = path.join(__dirname, '..', 'shieldagent.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS detection_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    attack_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    action TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    original_snippet TEXT,
    full_original TEXT,
    sanitized_content TEXT,
    flagged_text TEXT,
    reasoning TEXT
  )
`);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:80'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', createRouter(db));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ShieldAgent backend running on http://localhost:${PORT}`);
});
