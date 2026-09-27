import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', app: 'Resilify AI Backend', timestamp: new Date().toISOString() });
});

// Serve Static Frontend Production Build if present
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  console.log('[Server] Serving static production frontend from frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'Resilify.AI Backend API Service',
      status: 'ONLINE 🚀',
      mode: process.env.HINDSIGHT_MODE || 'local',
      activeBank: 'sre-incidents-bank',
      endpoints: {
        status: `http://localhost:${PORT}/api/status`,
        topology: `http://localhost:${PORT}/api/topology`,
        scenarios: `http://localhost:${PORT}/api/replays`,
        memories: `http://localhost:${PORT}/api/memory`,
        frontendApp: 'http://localhost:5173/'
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Resilify AI - Autonomous SRE Incident Memory Engine`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Hindsight Mode: ${process.env.HINDSIGHT_API_KEY ? 'Vectorize Hindsight Cloud API' : 'Local Hindsight Memory Engine'}`);
  console.log(`====================================================`);
});
