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

This causes confusion, unfair judging, and poor participant experience.

**EventFlow solves this with a reusable, modular event engine.**

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

Modular, role-based, and reusable by design.

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




