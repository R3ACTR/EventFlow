<img width="1500" height="500" alt="EVENTFLOW" src="https://github.com/user-attachments/assets/184cae65-9946-498c-bc8d-36e975db0193" />

# EVENTFLOW

 Modular, open-source infrastructure to run hackathons, OSS programs, and tech events — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## Table of Contents
- About
- Problem Statement
- Features
- Screenshots
- Installation
- Common Issues & Fixes
- Architecture
- Contributing
- Roadmap
- License

---

##  What is EventFlow?

**EventFlow** is an open-source, modular web platform that provides complete digital infrastructure to run hackathons, open-source programs, and community tech events.

It replaces scattered tools like **Google Forms, Sheets, emails, and chats** with **one unified system**.

---

## Problem Statement

Most tech events rely on:

- Disconnected tools  
- Manual tracking  
- Error-prone spreadsheets  
- No reusable infrastructure  

This results in confusion, inconsistent evaluation, and a poor participant experience.

EventFlow addresses these challenges by providing a reusable, modular event infrastructure engine.

---

## Features

###  Event Management
- Create and manage events
- Configure timelines and rules
- Enable or disable modules per event

### 👥 Registration & Roles
- Participant registration
- Role-based dashboards
- Secure access control

### 🧑‍🤝‍🧑 Team Formation
- Create or join teams
- Invite members
- Team size validation

### 📤 Project Submissions
- Phase-wise submissions
- GitHub repository linking
- Deadline enforcement

### 📢 Announcements
- Global announcements for all users
- Role-specific notifications
- Real-time updates

### 📜 Certificates & Credentials
- Auto-generated participation certificates
- Verify credentials via unique ID
- Downloadable PDF assets

### 🧑‍⚖️ Judge Evaluation
- Custom scoring rubrics
- Blind judging
- Auto-ranking and feedback

---

## 🖼️ Screenshots

 Note: The UI has been updated to a modern **Dark Sci-Fi Theme** with Aurora backgrounds.
<img width="1500" alt="EventFlow Sci-Fi UI" src="https://github.com/user-attachments/assets/184cae65-9946-498c-bc8d-36e975db0193" />
<!-- TODO: Update with new Sci-Fi Theme Screenshot -->

---

## Installation
---

## Health Check

### GET /health

Returns backend server status.

**Response:**

```json
{
  "success": true
}

### Prerequisites
- Node.js 18+
- pnpm or npm
- MongoDB

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/R3ACTR/EventFlow.git
   cd EventFlow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Copy the example env file and update it with your credentials:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

Visit: http://localhost:3000

---

## Common Issues & Fixes

This section covers frequently encountered issues and their solutions. If you're stuck, check here before opening an issue.

### 🔧 Environment Setup

#### Missing `.env.local` File
**Problem:** Application fails to start with configuration errors.

**Solution:** Create a `.env.local` file in the root directory by copying from the example:
```bash
cp .env.example .env.local
```

#### MongoDB Connection Failed
**Problem:** `MongoServerSelectionError` or connection timeout.

**Solution:**
1. Ensure MongoDB is running (locally or via MongoDB Atlas)
2. Verify your `MONGODB_URI` in `.env.local` is correct
3. For local MongoDB: `mongodb://localhost:27017/eventflow`
4. For Atlas: Use your cluster connection string (must include database name)

#### JWT_SECRET Error
**Problem:** `JWSInvalidSignatureError` during authentication.

**Solution:** Add a strong secret to your `.env.local`:
```env
JWT_SECRET=your_super_secret_key_here_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret
```

---

### 🔐 Authentication Issues

#### Google/GitHub OAuth Not Working
**Problem:** Social login fails with redirect or callback errors.

**Solution:**
1. Ensure `NEXTAUTH_URL` matches your environment exactly:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
2. Add authorized callback URLs in your OAuth provider's console:
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`
3. Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (and GitHub equivalents) are correctly set in `.env.local`

#### "User not found" After Registration
**Problem:** Can log in with credentials but user data doesn't appear.

**Solution:**
1. Check MongoDB connection is working
2. Ensure the User collection exists in your database
3. Try registering a new account via the web interface

---

### 🏗️ Build & Runtime Errors

#### Next.js Build Fails
**Problem:** `Error: Cannot find module` or TypeScript errors.

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm dev
```

#### TypeScript Errors in Development
**Problem:** Type errors blocking the build.

**Solution:** Ensure all required env variables are defined. Missing variables can cause type inference issues. Check `tsconfig.json` includes appropriate paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Port 3000 Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -i :3000
kill -9 <PID>

# Or start on a different port
PORT=3001 pnpm dev
```

---

### 🧪 Testing Issues

#### Tests Failing with Database Errors
**Problem:** Tests fail because they can't connect to the database.

**Solution:** Ensure MongoDB is running and `MONGODB_URI` is set. For CI environments, consider using `mongodb-memory-server` for isolated test databases.

---

### 📦 Common Dependency Issues

#### "Module not found" Errors
**Problem:** Missing packages during runtime.

**Solution:**
```bash
# Reinstall all dependencies
pnpm install

# Clear pnpm cache if needed
pnpm store prune
```

#### Node.js Version Mismatch
**Problem:** Build fails with syntax errors or unknown features.

**Solution:** Ensure you're using Node.js 18+. Check with:
```bash
node --version
```

Use nvm to switch versions if needed:
```bash
nvm install 18
nvm use 18
```

---

### 🚀 Production Deployment

#### Session Not Persisting
**Problem:** Users get logged out immediately after login in production.

**Solution:**
1. Set `NEXTAUTH_URL` to your production domain
2. Ensure `NEXTAUTH_SECRET` is set (different from JWT_SECRET recommended)
3. For HTTPS, ensure SSL certificates are properly configured

#### Environment Variables Not Loading
**Problem:** App works locally but fails in production.

**Solution:**
1. Verify all required env variables are set in your hosting platform (Vercel, Netlify, etc.)
2. Restart the deployment after adding new variables
3. Check platform-specific variable naming requirements

---

## Architecture

```
├── app/
│   ├── (auth)/          # Authentication routes (Login, Register)
│   ├── (dashboard)/     # Role-based dashboards (Admin, Participant, Judge)
│   ├── api/             # Backend API routes
│   └── layout.js        # Root layout & providers
├── components/          # Reusable UI components
├── models/              # Mongoose database models
├── lib/                 # Utility functions & DB connection
└── public/              # Static assets
```

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **MongoDB**. The project uses a modular folder structure to separate concerns between auth, dashboards, and API logic.
The app directory follows the Next.js 14 App Router architecture.

The models directory contains Mongoose schemas defining database structure.

Modular, role-based, and reusable by design.

Utility functions, database connection logic, and shared helpers

---

## 🤝 Contributing

1. Browse issues
2. Get assigned by maintainer
3. Make changes in your fork
4. Submit a pull request

Look for:
- `good first issue`
- `documentation`
- `help wanted`

---

## Roadmap

**Phase 1:** Core setup  
**Phase 2:** Teams, submissions, judging  
**Phase 3:** Mentors, certificates, analytics  
**Phase 4:** Performance & accessibility

---

## License

Licensed under the **MIT License**.
See `LICENSE` for details.

---

⭐ Star the repo if you like it  
🤝 Contributions are welcome  







