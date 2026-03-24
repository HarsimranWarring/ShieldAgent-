# ShieldAgent - AI Security Dashboard

ShieldAgent is a real-time prompt injection detection and sanitization system for AI agents operating in high-stakes domains (healthcare, nonprofits, enterprise systems).

## 🚀 Quick Start

### Docker (Recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## 🎯 Demo Scenarios

| # | Name | Attack Type | Severity |
|---|------|-------------|----------|
| 1 | Charity Email Override | Instruction Override | CRITICAL |
| 2 | Patient Triage Role Reassignment | Role Reassignment | HIGH |
| 3 | Food Relief Data Exfiltration | Data Exfiltration | HIGH |
| 4 | Privilege Escalation Attack | Privilege Escalation | CRITICAL |
| 5 | Hidden Formatting Injection | Safety Bypass | HIGH |
| 6 | Indirect External Injection | Indirect Injection | CRITICAL |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scan` | Analyze content for injection attacks |
| POST | `/api/custom-analysis` | Custom content analysis |
| GET | `/api/demo-scenarios` | Get all 6 demo scenarios |
| GET | `/api/stats` | Detection statistics |
| GET | `/api/logs` | Recent detection events |
| GET | `/health` | Health check |

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, SQLite (better-sqlite3)
- **Infrastructure**: Docker, nginx
