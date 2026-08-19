# 🚀 ProTask Manager

<div align="center">

# ProTask Manager

### Intelligent Full-Stack Task Management Platform

A modern, secure, and scalable task management web application built with **React, Vite, Node.js, Express, MongoDB, Redis, and Google Gemini AI**.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge\&logo=express\&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9%2B-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge\&logo=redis\&logoColor=white)](https://redis.io/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge\&logo=google\&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-lightgrey?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Project Objectives](#-project-objectives)
* [Key Features](#-key-features)
* [AI-Powered Task Assistant](#-ai-powered-task-assistant)
* [Authentication & Authorization](#-authentication--authorization)
* [Security Architecture](#-security-architecture)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Database Design](#-database-design)
* [API Architecture](#-api-architecture)
* [Caching Architecture](#-caching-architecture)
* [Frontend Architecture](#-frontend-architecture)
* [Backend Architecture](#-backend-architecture)
* [Environment Configuration](#-environment-configuration)
* [Local Development](#-local-development)
* [Docker Deployment](#-docker-deployment)
* [Production Build](#-production-build)
* [Google Cloud Deployment](#-google-cloud-deployment)
* [Application Screenshots](#-application-screenshots)
* [Security Best Practices](#-security-best-practices)
* [Performance & Scalability](#-performance--scalability)
* [API Reference](#-api-reference)
* [Troubleshooting](#-troubleshooting)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

# 📖 Overview

**ProTask Manager** is a full-stack productivity and task management platform designed to provide individuals and teams with a centralized environment for creating, organizing, monitoring, and managing tasks.

The application combines a modern React interface with a robust Node.js/Express backend and a MongoDB data layer. It also incorporates **Redis-compatible caching**, secure authentication, administrative controls, email verification, rate limiting, input sanitization, and an **AI-powered task assistant using Google Gemini**.

The system is designed with both development and production environments in mind. It can run locally through Node.js and Vite, operate with MongoDB/Redis infrastructure, or be containerized using Docker and Nginx.

The project also includes deployment validation screenshots demonstrating the application operating successfully after deployment using Google Cloud infrastructure.

---

# 🎯 Project Objectives

The main objectives of ProTask Manager are to:

* Provide a centralized task management environment.
* Enable users to create, update, organize, and delete tasks.
* Provide task filtering based on status, priority, and category.
* Implement secure user registration and authentication.
* Support email verification and OTP-based verification workflows.
* Provide administrative user management.
* Introduce AI-assisted task description generation.
* Improve application performance through caching.
* Implement production-oriented security middleware.
* Provide a responsive and modern user interface.
* Support containerized deployment.
* Provide a scalable architecture suitable for cloud environments.
* Maintain a fallback mode when optional infrastructure services are unavailable.

---

# ✨ Key Features

## 📋 Task Management

Users can manage their complete task lifecycle:

* Create tasks.
* Edit existing tasks.
* Delete tasks.
* View task details.
* Assign priorities.
* Assign categories.
* Set task status.
* Add descriptions.
* Set due dates.
* Assign tasks to users.
* Track task creation and modification dates.

### Supported Statuses

| Status        | Description                          |
| ------------- | ------------------------------------ |
| `Pending`     | Task has not started                 |
| `In Progress` | Task is actively being worked on     |
| `Completed`   | Task has been successfully completed |

### Supported Priorities

| Priority | Description       |
| -------- | ----------------- |
| `Low`    | Non-critical work |
| `Medium` | Standard priority |
| `High`   | Important work    |

---

# 🔎 Advanced Task Filtering

The application provides filtering capabilities based on:

* Status
* Priority
* Category
* Sorting
* Pagination
* Task ownership

This allows users to efficiently navigate large task collections.

---

# 📊 Task Statistics

The dashboard provides task-related statistics to give users an overview of their productivity and workload.

Examples include:

* Total tasks
* Pending tasks
* In-progress tasks
* Completed tasks
* Priority distribution
* Category distribution

---

# 👤 User Management

Users can manage their account information through the application.

Supported functionality includes:

* User registration
* User login
* User logout
* Email verification
* OTP verification
* Resending verification emails
* Profile management
* Password updates
* Account information management

---

# 🛡️ Administrative Management

The platform provides a dedicated administrative control system.

Administrators can:

* View registered users.
* Create users.
* Update user roles.
* Ban or unban users.
* Delete users.
* Change user passwords.
* View administrative statistics.
* Manage user accounts.

The authorization system separates standard users from administrators through role-based access control.

---

# 🤖 AI-Powered Task Assistant

One of the platform's most important capabilities is the integrated **Google Gemini AI task assistant**.

The assistant can help users transform a simple task title into a structured and actionable task specification.

### AI capabilities include:

* Automatic task description generation.
* Task refinement.
* Acceptance criteria generation.
* Subtask generation.
* Completion-time estimation.
* Suggested tags.
* Structured Markdown descriptions.

### Supported AI writing styles

The application supports multiple task-generation styles, including:

* Actionable
* Detailed
* Concise
* User Story
* Bug Report
* Technical

For example, instead of entering:

> Implement authentication

the AI assistant can transform it into a structured task containing:

* Objective
* Context
* Technical deliverables
* Acceptance criteria
* Subtasks
* Definition of Done
* Estimated completion time
* Suggested tags

---

# 🔄 AI Fallback Architecture

The AI system was designed with resilience in mind.

If `GEMINI_API_KEY` is unavailable, the application does not necessarily fail.

Instead, it provides an internal intelligent template-based fallback system.

### Architecture

```text
User Request
     │
     ▼
AI Task Assistant
     │
     ├── Gemini API Available
     │       │
     │       ▼
     │   Google Gemini
     │       │
     │       ▼
     │   AI-generated result
     │
     └── Gemini unavailable
             │
             ▼
       Local Smart Templates
             │
             ▼
       Structured task result
```

This improves application resilience and allows the task-generation feature to remain functional during AI service interruptions or when an API key has not yet been configured.

---

# 🔐 Authentication & Authorization

ProTask Manager implements token-based authentication using **JSON Web Tokens (JWT)**.

Authentication middleware supports tokens supplied through:

* Authorization headers
* Cookies
* Signed cookies
* Session data

Authenticated users are resolved against MongoDB when the database is available.

The application also includes an in-memory fallback mechanism for development/resilience scenarios.

---

# 🔑 Role-Based Access Control

The system implements role-based authorization.

Two primary roles are supported:

```text
user
admin
```

### User

Standard users can:

* Manage their own account.
* Create tasks.
* Update tasks.
* Delete authorized tasks.
* View their task information.

### Administrator

Administrators can additionally:

* Manage users.
* Create users.
* Change roles.
* Ban users.
* Delete users.
* Update user passwords.
* Access administrative statistics.

---

# 🛡️ Security Architecture

Security is a major component of the application architecture.

The backend includes multiple layers of protection.

## Helmet

HTTP security headers are configured using Helmet.

```text
helmet
```

This helps protect against several common web security risks by configuring appropriate HTTP headers.

---

## CORS

Cross-Origin Resource Sharing is configured with credential support.

This allows authenticated requests involving cookies and sessions.

---

## Rate Limiting

The API includes general rate limiting:

```text
300 requests / 15 minutes / IP
```

Authentication endpoints use a stricter policy:

```text
60 authentication requests / 15 minutes / IP
```

Protected authentication endpoints include:

```text
/api/users/login
/api/users/register
/api/users/resend-verification
```

---

## HTTP Parameter Pollution Protection

The project uses:

```text
hpp
```

to reduce HTTP Parameter Pollution risks.

Specific task filtering parameters are explicitly whitelisted.

---

## XSS Protection

The application includes a custom XSS sanitization middleware.

It recursively sanitizes:

* Request body
* Query parameters
* Route parameters
* Nested objects
* Arrays

The implementation uses the `xss` package.

---

## Input Validation

The backend uses:

```text
express-validator
```

for validation of:

* Registration data
* Login data
* Email verification
* Task creation
* Task updates
* User profile updates
* Password updates
* Administrative operations
* Contact messages

This provides a structured validation layer before controller execution.

---

## Password Security

Passwords are hashed using:

```text
bcryptjs
```

The `User` model automatically hashes passwords before persistence.

Plain-text passwords are never intentionally stored as database credentials.

---

## Secure Session Cookies

The application configures HTTP-only cookies and production-aware security settings.

Example configuration:

```text
httpOnly: true
secure: production-aware
sameSite: lax
```

This reduces the risk of client-side JavaScript accessing authentication cookies.

---

# 🧰 Technology Stack

## Frontend

| Technology     | Purpose                             |
| -------------- | ----------------------------------- |
| React 19       | UI framework                        |
| Vite 6         | Development server and build system |
| Tailwind CSS 4 | Styling                             |
| Motion         | UI animations                       |
| Lucide React   | Icons                               |
| Axios          | HTTP client                         |
| React Markdown | Markdown rendering                  |

---

## Backend

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| Node.js            | Runtime                        |
| Express.js         | REST API                       |
| Mongoose           | MongoDB ODM                    |
| JWT                | Authentication                 |
| bcryptjs           | Password hashing               |
| Nodemailer         | Email delivery                 |
| Express Validator  | Input validation               |
| Helmet             | Security headers               |
| Express Rate Limit | API protection                 |
| Cookie Parser      | Cookie handling                |
| Express Session    | Session management             |
| HPP                | Parameter pollution protection |
| XSS                | Input sanitization             |

---

## Data & Infrastructure

| Technology            | Purpose                               |
| --------------------- | ------------------------------------- |
| MongoDB               | Primary database                      |
| Redis                 | Caching                               |
| MongoDB Memory Server | Development/fallback database support |
| Docker                | Containerization                      |
| Docker Compose        | Multi-container orchestration         |
| Nginx                 | Reverse proxy                         |
| Google Cloud          | Cloud deployment                      |
| Google Gemini         | AI task assistance                    |

---

# 🏗️ System Architecture

The application follows a layered full-stack architecture.

```text
                         ┌──────────────────────┐
                         │      User Browser    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite UI    │
                         │     Tailwind CSS     │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP / REST
                                    ▼
                         ┌──────────────────────┐
                         │   Express.js API     │
                         ├──────────────────────┤
                         │ Authentication       │
                         │ Validation           │
                         │ Security Middleware  │
                         │ Rate Limiting        │
                         │ Controllers          │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐                ┌─────────────────┐
          │    MongoDB       │                │     Redis       │
          │  Primary Store   │                │     Cache       │
          └──────────────────┘                └─────────────────┘
                    │
                    │
                    ▼
          ┌──────────────────┐
          │  User / Task     │
          │     Models       │
          └──────────────────┘

                    Express API
                         │
                         ▼
                ┌─────────────────┐
                │  Gemini AI API  │
                │ Task Assistant  │
                └─────────────────┘
```

---

# 📂 Project Structure

The project is organized into clear frontend, backend, configuration, infrastructure, and documentation components.

```text
Protask-manager-main/
│
├── client/
│   ├── index.html
│   │
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       │
│       ├── components/
│       │   ├── About.jsx
│       │   ├── AdminPanel.jsx
│       │   ├── AiTaskAssistant.jsx
│       │   ├── AuthInteractiveWidgets.jsx
│       │   ├── Contact.jsx
│       │   ├── EmailVerification.jsx
│       │   ├── Login.jsx
│       │   ├── Logo.jsx
│       │   ├── Register.jsx
│       │   ├── Settings.jsx
│       │   ├── TaskDetailModal.jsx
│       │   ├── TaskForm.jsx
│       │   ├── TaskList.jsx
│       │   └── TaskStats.jsx
│       │
│       ├── context/
│       │   └── LanguageContext.jsx
│       │
│       └── services/
│           ├── ai.js
│           ├── api.js
│           └── auth.js
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── validators.js
│   │   └── xssMiddleware.js
│   │
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── cacheRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   │
│   └── utils/
│       └── sendEmail.js
│
├── Screenshots/
│   ├── Web app working locally/
│   └── After deployment using GCP/
│
├── docker-compose.yml
├── nginx.conf
├── vite.config.js
├── server.js
├── package.json
├── package-lock.json
├── bun.lock
├── metadata.json
├── .gitignore
└── README.md
```

---

# 🗄️ Database Design

The application uses MongoDB as its primary persistence layer.

## User Collection

The `User` model contains fields including:

```text
_id
name
email
password
age
location
gender
role
isBanned
isVerified
verificationToken
verificationTokenExpires
verificationOTP
verificationOTPExpires
createdAt
updatedAt
```

---

## Task Collection

The `Task` model contains:

```text
_id
title
description
status
priority
category
dueDate
user
assignedTo
assignedToEmail
assignedToName
createdBy
createdAt
updatedAt
```

Task ownership and assignment use MongoDB ObjectId references.

---

# ⚡ Redis Caching Architecture

ProTask Manager includes a hybrid caching architecture.

When a Redis server is available:

```text
Application
     │
     ▼
 Redis Server
```

When Redis is unavailable:

```text
Application
     │
     ▼
In-Memory Cache
```

This provides resilience while maintaining a simple deployment experience.

The Redis service supports:

* Cache retrieval
* Cache insertion
* TTL expiration
* Key deletion
* Pattern deletion
* Cache flushing
* Cache statistics
* Hit/miss tracking
* Hit ratio calculation

---

# 📈 Cache Monitoring

The application exposes cache management endpoints.

```text
GET  /api/cache/stats
POST /api/cache/flush
POST /api/cache/test
```

The statistics include:

* Cache mode
* Connection status
* Number of keys
* Cache hits
* Cache misses
* Total requests
* Hit ratio
* Last cache action

---

# 🎨 Frontend Architecture

The frontend follows a component-oriented React architecture.

Major UI components include:

### Authentication

```text
Login
Register
EmailVerification
AuthInteractiveWidgets
```

### Task Management

```text
TaskList
TaskForm
TaskDetailModal
TaskStats
```

### Administration

```text
AdminPanel
```

### AI

```text
AiTaskAssistant
```

### General Application

```text
About
Contact
Settings
Logo
```

This separation improves maintainability and allows individual features to evolve independently.

---

# 🔌 API Architecture

The backend exposes RESTful endpoints under:

```text
/api
```

Main API groups include:

```text
/api/users
/api/tasks
/api/ai
/api/cache
/api/health
```

---

# 👥 User API

### Authentication

```http
POST /api/users/register
POST /api/users/login
POST /api/users/logout
```

### Email Verification

```http
POST /api/users/verify-email
POST /api/users/resend-verification
```

### Current User

```http
GET /api/users/me
```

### Profile

```http
PUT /api/users/profile
PUT /api/users/password
```

### Contact

```http
POST /api/users/contact
```

---

# 👑 Administration API

Administrative endpoints include:

```http
GET    /api/users
GET    /api/users/admin/stats
POST   /api/users/admin/create
PUT    /api/users/:id/role
PUT    /api/users/:id/ban
PUT    /api/users/:id/password
DELETE /api/users/:id
```

These routes require authentication and administrative privileges.

---

# 📋 Task API

### Retrieve tasks

```http
GET /api/tasks
```

### Create task

```http
POST /api/tasks
```

### Update task

```http
PUT /api/tasks/:id
```

### Delete task

```http
DELETE /api/tasks/:id
```

---

# 🤖 AI API

### Generate task description

```http
POST /api/ai/generate-description
```

### Refine task description

```http
POST /api/ai/refine-description
```

---

# ❤️ Health Check

The application exposes:

```http
GET /api/health
```

A successful response provides server health information and Redis/cache status.

Example:

```json
{
  "success": true,
  "message": "Server is running",
  "time": "2026-08-19T10:00:00.000Z",
  "redis": {
    "isConnected": true
  }
}
```

---

# ⚙️ Environment Configuration

Create an environment file in the project root:

```text
.env
```

Example configuration:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/Tasks

JWT_SECRET=replace_with_a_strong_random_secret

COOKIE_SECRET=replace_with_a_strong_cookie_secret

SESSION_SECRET=replace_with_a_strong_session_secret

REDIS_URL=redis://127.0.0.1:6379

GEMINI_API_KEY=your_gemini_api_key

APP_URL=http://localhost:3000

GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

For custom SMTP:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM="ProTask Manager <no-reply@example.com>"
```

> **Important:** Never commit `.env` files, database credentials, API keys, JWT secrets, SMTP passwords, or production secrets to GitHub.

---

# 💻 Local Development

## Prerequisites

Install the following:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Redis (optional)
* Git

Optional:

* Docker
* Docker Compose

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Protask-manager-main
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env
```

and configure the required environment variables.

At minimum, configure:

```env
MONGO_URI=
JWT_SECRET=
SESSION_SECRET=
COOKIE_SECRET=
```

For AI functionality:

```env
GEMINI_API_KEY=
```

---

## 4. Start the Application

```bash
npm run dev
```

The application will run on:

```text
http://localhost:3000
```

---

# 🧪 Development Architecture

During development, Express integrates with Vite middleware.

```text
Browser
   │
   ▼
Express
   │
   ├── /api/*
   │       │
   │       ▼
   │    REST API
   │
   └── Frontend
           │
           ▼
       Vite Middleware
           │
           ▼
        React App
```

This provides a convenient single development server.

---

# 🐳 Docker Deployment

The project includes Docker Compose infrastructure.

The provided architecture contains:

```text
Nginx
   │
   ▼
Node.js / Express
   │
   ├── MongoDB
   │
   └── Redis
```

Start the stack with:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d --build
```

Stop the environment:

```bash
docker compose down
```

---

# 🌐 Nginx Reverse Proxy

Nginx is configured as the reverse proxy in the containerized architecture.

Responsibilities include:

* Reverse proxying requests to Node.js.
* HTTP connection management.
* WebSocket upgrade support.
* Gzip compression.
* Static asset caching.
* Forwarded headers.
* Health endpoint handling.
* Request size configuration.

The default upstream is:

```text
app:3000
```

---

# 🏭 Production Build

The project includes a production build process.

Run:

```bash
npm run build
```

The build performs:

1. Vite frontend compilation.
2. Server bundling through esbuild.
3. Production server generation.

The generated server bundle is:

```text
dist/server.cjs
```

Start the production application with:

```bash
npm start
```

---

# ☁️ Google Cloud Deployment

The project includes deployment validation screenshots under:

```text
Screenshots/After deployment using GCP/
```

These screenshots demonstrate the application operating after deployment using Google Cloud infrastructure.

The deployment architecture is designed to support cloud/container environments and includes production-oriented configuration such as:

* `NODE_ENV=production`
* Proxy awareness
* Production cookies
* Environment-based configuration
* MongoDB external connectivity
* Redis integration
* Production frontend serving
* Health checks
* Error handling
* Security middleware

For a production deployment, secrets should be configured through the cloud platform's secret/environment management facilities rather than committed to the repository.

---

# 📸 Application Screenshots

The repository includes two screenshot collections.

## Local Application

Located in:

```text
Screenshots/Web app working locally/
```

Examples include:

* Login page
* Registration page
* Two-factor/verification workflow
* Dashboard
* Task creation
* Task editing
* Task deletion
* Task filtering
* Priority filtering
* Category filtering
* Settings
* Admin panel
* Contact page
* About page

## Cloud Deployment

Located in:

```text
Screenshots/After deployment using GCP/
```

Examples include:

* Successfully deployed web application
* Dashboard
* Sign in
* Sign up
* Task creation
* Task updates
* Task deletion
* User management
* Admin panel
* Settings
* Filtering functionality

---

# 🔒 Security Best Practices

The project follows several security principles.

### Authentication

* JWT-based authentication.
* Password hashing with bcrypt.
* Protected routes.
* Role-based authorization.

### Application Security

* Helmet security headers.
* CORS configuration.
* XSS sanitization.
* HTTP Parameter Pollution protection.
* Request validation.
* API rate limiting.
* Authentication-specific rate limiting.

### Session Security

* HTTP-only cookies.
* Production-aware secure cookies.
* SameSite cookie configuration.
* Configurable session secrets.

### Infrastructure Security

Production environments should additionally use:

* HTTPS/TLS.
* Managed secrets.
* Restricted database access.
* Redis authentication where appropriate.
* Firewall/network controls.
* Cloud IAM.
* Regular dependency updates.
* Centralized monitoring and logging.

---

# 🚀 Performance & Scalability

ProTask Manager includes several mechanisms intended to improve performance and scalability.

## Redis Caching

Frequently accessed information can be cached using Redis.

## In-Memory Fallback

The application can continue operating with an in-memory cache when Redis is unavailable.

## Request Limits

Body parsing is restricted to:

```text
1 MB
```

while Nginx allows larger uploads at the reverse-proxy layer where configured.

## Compression

Nginx supports Gzip compression for common web assets and API responses.

## Static Asset Caching

Nginx applies cache headers to static assets such as:

```text
.js
.css
.png
.jpg
.svg
.woff
.woff2
```

## Database Architecture

MongoDB provides a document-oriented persistence layer suitable for horizontal scaling and cloud-hosted deployments.

---

# 🧩 Resilience Strategy

A key architectural characteristic of ProTask Manager is graceful degradation.

Several services have fallback behavior.

```text
                ┌───────────────┐
                │   MongoDB     │
                └───────┬───────┘
                        │
                 unavailable
                        │
                        ▼
                Hybrid/In-Memory
                   operation
```

Similarly:

```text
                 Redis
                   │
          ┌────────┴────────┐
          │                 │
      Available        Unavailable
          │                 │
          ▼                 ▼
       Redis            In-Memory
       Cache              Cache
```

And:

```text
              Gemini API
                  │
          ┌───────┴───────┐
          │               │
       Available       Missing
          │               │
          ▼               ▼
     Gemini AI       Smart Templates
```

This design makes the application more tolerant of infrastructure failures during development and controlled deployment scenarios.

---

# 🧪 Validation & Testing

The project can be manually validated through the application's major workflows.

Recommended validation sequence:

### Authentication

```text
Register
   ↓
Email Verification
   ↓
Login
   ↓
Dashboard
```

### Task Workflow

```text
Create Task
   ↓
View Task
   ↓
Edit Task
   ↓
Filter Task
   ↓
Complete Task
   ↓
Delete Task
```

### Administration

```text
Admin Login
   ↓
Admin Panel
   ↓
View Users
   ↓
Change Role
   ↓
Ban / Unban
   ↓
Manage Account
```

### AI Workflow

```text
Task Title
   ↓
AI Assistant
   ↓
Generate Description
   ↓
Acceptance Criteria
   ↓
Subtasks
   ↓
Estimated Time
   ↓
Save Task
```

---

# 🛠️ Troubleshooting

## MongoDB connection problems

Verify:

```env
MONGO_URI=
```

Make sure the URI is valid and that the MongoDB server or MongoDB Atlas cluster is accessible.

---

## Gemini AI not working

Verify:

```env
GEMINI_API_KEY=
```

If the API key is unavailable, the application can use its built-in smart template fallback for task description generation.

---

## Redis not connecting

Verify:

```env
REDIS_URL=redis://127.0.0.1:6379
```

If Redis is unavailable, the application can switch to its in-memory caching mode.

---

## Port already in use

If port `3000` is occupied, configure:

```env
PORT=3001
```

Then restart the application.

---

## Authentication errors

Check that:

```env
JWT_SECRET=
SESSION_SECRET=
COOKIE_SECRET=
```

are configured consistently and that the browser is allowing the required cookies.

---

# 🔮 Future Improvements

Potential future enhancements include:

* Automated unit testing.
* Automated integration testing.
* End-to-end testing with Playwright or Cypress.
* CI/CD through GitHub Actions.
* Advanced audit logging.
* Task activity history.
* Team workspaces.
* Real-time task collaboration.
* WebSocket-based notifications.
* Advanced Redis caching strategies.
* Background job processing.
* Password reset workflows.
* OAuth authentication.
* Multi-factor authentication expansion.
* File attachments.
* Advanced analytics dashboards.
* Calendar integration.
* Task dependency management.
* Recurring tasks.
* Mobile application.
* Progressive Web App support.
* Advanced AI task planning.
* AI-powered prioritization.
* AI-powered productivity analytics.

---

# 📈 Potential Enterprise Architecture

For larger deployments, the application can evolve toward:

```text
                         Load Balancer
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
          App Instance    App Instance    App Instance
               │              │              │
               └──────────────┼──────────────┘
                              │
                     ┌────────┴────────┐
                     │                 │
                     ▼                 ▼
                  Redis            MongoDB
                  Cluster          Cluster
                     │
                     ▼
                Background
                  Workers
                     │
                     ▼
                AI Services
```

This architecture would allow the platform to support significantly larger workloads.

---

# 📦 Available npm Commands

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm install`   | Install project dependencies         |
| `npm run dev`   | Start development server             |
| `npm run build` | Build frontend and production server |
| `npm start`     | Start production build               |
| `npm run clean` | Remove generated build artifacts     |

---

# 📝 Development Guidelines

When extending the project:

### Frontend

Keep reusable UI components inside:

```text
client/src/components/
```

API-related logic should remain inside:

```text
client/src/services/
```

Application-wide context should remain inside:

```text
client/src/context/
```

### Backend

Follow the existing separation:

```text
routes
   ↓
controllers
   ↓
models/services/configuration
```

Security middleware should remain centralized in:

```text
server/middleware/
```

Database and cache configuration should remain inside:

```text
server/config/
```

---

# 🔐 Environment Security

Never commit:

```text
.env
.env.local
.env.production
```

or any files containing:

```text
GEMINI_API_KEY
MONGO_URI
JWT_SECRET
SESSION_SECRET
COOKIE_SECRET
GMAIL_PASS
SMTP_PASS
```

Use environment variables or a dedicated secret-management solution in production.

---

# 📄 License

This project currently uses the **ISC License** as specified by the project's `package.json`.

---

# 👨‍💻 Author

## Yassine Kalthoum

**Software & Network Engineering Expert**

Specialized in:

* Software Engineering
* Full-Stack Web Development
* Network Engineering
* Cybersecurity
* System Architecture
* Database Systems
* Cloud Deployment
* UI/UX Design
* AI-Powered Applications

---

# 🏆 Project Highlights

ProTask Manager demonstrates the integration of multiple modern software engineering concepts into a single production-oriented application:

```text
                    PROTASK MANAGER
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
     Frontend           Backend          Infrastructure
        │                  │                  │
     React             Express            Docker
     Vite              Node.js            Nginx
     Tailwind          JWT                Redis
     Motion            MongoDB            Cloud
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                      Gemini AI
                           │
                           ▼
                 Intelligent Productivity
```

The project combines **full-stack development, secure API design, database management, caching, AI integration, containerization, and cloud deployment** into a cohesive task-management platform.

---

# ⭐ Final Project Summary

**ProTask Manager** is more than a basic CRUD application. It is a complete full-stack productivity platform designed around modern software engineering principles.

The project demonstrates:

* ✅ Modern React frontend architecture
* ✅ RESTful Express backend
* ✅ MongoDB persistence
* ✅ Redis caching
* ✅ JWT authentication
* ✅ Role-based authorization
* ✅ Email verification
* ✅ Administrative management
* ✅ AI-powered task generation
* ✅ Input validation
* ✅ XSS protection
* ✅ HTTP Parameter Pollution protection
* ✅ Helmet security headers
* ✅ API rate limiting
* ✅ Secure password hashing
* ✅ Nginx reverse proxy
* ✅ Docker infrastructure
* ✅ Production build pipeline
* ✅ Cloud deployment readiness
* ✅ Resilient fallback architecture

The result is a **modern, secure, intelligent, and extensible task management platform** that provides a strong foundation for future enterprise-level productivity features.
