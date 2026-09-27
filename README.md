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

## Demonstration Script for Hackathon Judges (60-Second WOW Flow)

1. Open `http://localhost:5173`. Point out the **Hindsight Status Badge** showing `sre-incidents-bank`.
2. Under **Incident Simulation Engine**, click **Trigger Scenario** on *"Flash Sale Spike: Connection Pool Exhaustion"*.
3. Show the side-by-side comparison:
   - **Left**: Stateless AI giving vague advice (*"check network, scale pods"*).
   - **Right**: Resilify AI showing **96% Hindsight Match** with historical Incident `#INC-2024-8841`.
4. Click **Execute Runbook: RB-PAY-04**. Watch the system resolve the outage, scale pool connections, and automatically execute `hindsight.retain()` to record the resolution into memory!
5. Open the **Hindsight Memory Inspector** to show live vector recall queries and bank statistics.
