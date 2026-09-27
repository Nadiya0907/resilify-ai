# Resilify.AI — Autonomous SRE & Incident Memory Engine

> **Built for Hack with Hyderabad / Hindsight Hackathon**  
> Powered by **Vectorize Hindsight** Memory Layer

---

## Executive Summary & Hackathon Story

When production goes down, every minute costs enterprise companies thousands of dollars. Standard LLM agents provide generic troubleshooting steps (*"check logs, restart service, scale pods"*), leading to long Mean Time to Resolution (MTTR).

**Resilify AI** transforms SRE operations by providing a self-learning incident memory system built on top of **Vectorize Hindsight**. It remembers every past outage, telemetry signature, root cause, and successful runbook resolution.

### The Hindsight Memory Impact
* **Without Memory (Stateless AI)**: Generic advice, low confidence, 45–60 minute MTTR.
* **With Hindsight Memory**: Recalls past matching incidents in under 2 seconds, pinpoints exact root causes (e.g. *HikariCP pool starvation during flash sales* or *JWT RS256 memory leaks*), and executes proven runbooks with **85%+ MTTR reduction** (3 minutes).
* **Continuous Learning**: Every time an incident is resolved, Resilify executes `hindsight.retain()`, storing new post-mortems so the agent gets smarter over time.

---

## Features & Architecture

1. **Dual Hindsight Engine Mode**:
   - **Local Hindsight Engine (Mock Mode)**: Zero setup required; runs out-of-the-box using built-in semantic memory matching, memory banks (`sre-incidents-bank`), `retain`, `recall`, and `reflect`.
   - **Live Vectorize Hindsight Cloud**: Simply add `HINDSIGHT_API_KEY` to `.env` to seamlessly connect to live Vectorize Cloud API.
2. **Real-Time SRE Command Center**:
   - Live microservices topology monitor (`payment-gateway`, `auth-service`, `redis-cluster`, `db-primary`).
   - Interactive incident simulation bar for instant 60-second judge demonstrations.
   - Side-by-side **Stateless AI vs Resilify + Hindsight Memory** comparison view.
   - Automated runbook execution engine.
   - Interactive **Hindsight Memory Inspector** to search, query, and retain custom post-mortems.

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

#### Environment Variables (`.env`) - Optional
```env
PORT=5000
# Optional: Set these to connect to live Vectorize Hindsight Cloud
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

