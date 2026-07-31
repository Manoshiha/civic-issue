# 🚀 CivicFix

## 📌 Project Overview

CivicFix is a full-stack web application developed as part of the Second Semester Web Development Module at the University of Moratuwa. It provides a centralized platform where citizens can report civic issues such as road damage, garbage collection problems, street light failures, and water leakages. Authorities can efficiently manage, monitor, and resolve these issues through an administrative dashboard.
---

# 🎯 Problem Statement

Traditional civic issue reporting methods often involve manual complaints, limited tracking, and poor communication between citizens and responsible authorities.

CivicFix addresses these problems by providing:

- A simple issue reporting mechanism
- Location-based issue tracking
- Transparent issue status updates
- Efficient management tools for authorities

---

# 🎯 Objectives

- Develop an online platform for reporting civic issues
- Allow citizens to submit issues with descriptions and locations
- Enable authorities to manage and update issue statuses
- Provide analytical insights through dashboards
- Improve transparency between citizens and authorities

---

# ✨ Features

## 👤 Citizen Features

- Register and login securely
- Report civic issues
- Upload issue details
- Select issue location using an interactive map
- Track reported issue status
- View resolved issues

---

## 🏢 Authority Features

- Secure authority login
- View reported issues
- Manage issue lifecycle
- Update issue status
- Monitor reported issues through dashboard
- Analyze issue trends

---

## 🤖 AI-Powered Issue Classification

The system uses AI-based classification to categorize reported issues automatically.

Examples:

- Road damage
- Garbage collection
- Street light problems
- Water leakage

This reduces manual classification effort.

---

## 📍 Interactive Map

Integrated with **Leaflet Maps** to allow:

- Location selection
- Issue visualization
- Geographic monitoring of reported problems

---

## 📊 Analytics Dashboard

Provides insights such as:

- Total reported issues
- Pending issues
- Resolved issues
- Issue categories distribution

---

## 🏗️ System Architecture


             Users
                │
                ▼
       React.js Frontend
                │
             REST API 
                │
                ▼
      Node.js + Express.js
                │
                ▼
         MySQL Database
                │
                ▼
         Server (XAMPP)

---

# 💻 Tech Stack

## Frontend

| Technology | Purpose |

| React.js | User interface development |
| Vite | Frontend build tool |
| Tailwind CSS | Styling |
| Leaflet | Interactive maps |

---

## Backend

| Technology | Purpose |

| Node.js | Server-side runtime |
| Express.js | REST API development |

---

## Database

| Technology | Purpose |

| MySQL | Data storage and management |

---

## Server

| Technology |

| Apache Server (XAMPP) |

---

# 🚀 Installation Guide

### Clone Repository

```bash
git clone https://github.com/Manoshiha/civic-issue.git
cd civic-issue
```

### Frontend

```bash
cd civic-isssue-frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

### Backend

```bash
cd civic-issue-backend
npm install
npm start
```

Runs on:

```
http://localhost:5000
```

##Future Improvements

Possible enhancements:

Mobile application
Real-time notifications
Email/SMS alerts
Advanced AI issue prediction
Cloud deployment

## 📜 License

This project was developed for educational purposes only.
