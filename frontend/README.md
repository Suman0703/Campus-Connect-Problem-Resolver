# 🎓 Campus Connect

**A Smart Campus Management & Issue Resolution Platform**

Campus Connect is a comprehensive, role-based full-stack web application designed to bridge the communication gap between students and university administration. It streamlines the process of reporting campus issues, tracking their resolution in real-time, and securely broadcasting hierarchical administrative announcements.

[🚀 View Live Demo](https://campus-connect-problem-resolver.vercel.app)

---

## ✨ Key Features

### 👨‍🎓 Student Portal
* **Issue Reporting:** Submit detailed complaints across various categories (Hostel, Maintenance, IT, etc.) with photo evidence.
* **Live Tracking:** Monitor the status of reported issues from 'Pending' to 'In Progress' and 'Resolved'.
* **Direct Routing:** Option to route specific issues directly to relevant department administrators.
* **Campus Notices:** View official announcements, emergency alerts, and download attached documents (PDFs, Word files, Images).

### 👨‍💼 Administrator Dashboard
* **Department Inbox:** Manage and update the status of issues routed to the specific department.
* **Special Reports:** Dedicated inbox for issues explicitly assigned to the admin by students.
* **Announcement Broadcasting:** Publish text updates and attach files/images directly to the student portal.
* **Content Management:** Full control to review and delete past broadcasted announcements.

### 🛡️ System Overseer (Super Admin)
* **Global Analytics:** Real-time metrics on registered users, total complaints, and resolution rates.
* **Personnel Management:** Approve, review, and permanently revoke access for department administrators.
* **Hierarchical Directives:** Push secure, internal announcements and procedural documents exclusively to the Administrator tier.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Vite (Build Tool)
* Tailwind CSS (Styling & Responsive UI)
* React Router (Navigation)
* React Hot Toast (Notifications)

**Backend:**
* Node.js
* Express.js
* MongoDB & Mongoose (Database & ORM)
* JSON Web Tokens (JWT Authentication)
* Multer (Multipart/form-data handling for image & document uploads)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the project locally on your machine.

### Prerequisites
* Node.js installed
* MongoDB installed (or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Suman0703/Campus-Connect-Problem-Resolver
cd campus-connect

```
### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
---
### 📂 Project Architecture
The application is structured as a monorepo containing both the client and server.

* backend: Contains Express controllers, Mongoose models, authentication middleware, and Multer upload configurations.

* frontend: Contains React components, contextual pages (Dashboards, Login, Announcements), and global state handling.

* uploads: Secure directory managed by the backend to store user-uploaded evidence and administrative documents.

---
### 👨‍💻 Author
**Suman Devi**

**B.Tech Computer Science and Engineering**

