# Resilify.AI — Production Deployment Guide

This guide covers how to deploy **Resilify.AI** live to the web for your hackathon submission.

---

## Option 1: Render.com (Recommended 100% Free Unified Deployment)

Render allows you to host both the Node.js Express backend and the React frontend together as a single web service.

### Step 1: Push Code to GitHub
```powershell
cd C:\Users\khali\.gemini\antigravity\scratch\resilify-ai
git init
git add .
git commit -m "feat: Resilify AI production release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resilify-ai.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Log into [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `resilify-ai`.
4. Configure settings:
   - **Name**: `resilify-ai`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && cd ../frontend && npm install && npm run build`
   - **Start Command**: `node server.js`
5. Add Environment Variables under **Environment**:
   - `HINDSIGHT_MODE` = `cloud`
   - `HINDSIGHT_API_KEY` = `[Your Vectorize Hindsight API Key]`
6. Click **Create Web Service**.

Render will build the React frontend into `frontend/dist` and start the backend server, serving your complete application live at `https://resilify-ai.onrender.com`!

---

## Option 2: Vercel (Frontend) + Render/Railway (Backend)

If you prefer deploying frontend and backend separately:

### Backend Deployment (Render or Railway)
1. Deploy `backend` folder as a Node.js web service.
2. Note your backend live URL (e.g., `https://resilify-backend.onrender.com`).

### Frontend Deployment (Vercel)
1. Log into [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** -> Import `resilify-ai`.
3. Set Root Directory: `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://resilify-backend.onrender.com/api`
5. Click **Deploy**.

---

## Option 3: Docker Deployment

If you want to run via Docker:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY . .
RUN cd frontend && npm run build
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

Build & run container:
```bash
docker build -t resilify-ai .
docker run -p 5000:5000 -e HINDSIGHT_MODE=cloud -e HINDSIGHT_API_KEY=your_key resilify-ai
```
