# ProTask Manager — Professional Project Report

**Public URL** : https://mern-task-manager-327408677300.europe-west2.run.app

## 1. Introduction

ProTask Manager is a full-stack task management platform designed to provide users with a secure, efficient, and intelligent environment for organizing and tracking their work. The project was developed as a complete software engineering solution rather than as a simple CRUD application. It combines a modern React/Vite frontend, a Node.js and Express backend, MongoDB persistence, Redis caching, secure authentication, administrative controls, email verification, AI-assisted task generation, Docker-based infrastructure, Nginx reverse proxying, and Google Cloud deployment.

The motivation behind the project was to address a common limitation of basic task management applications: although users can often create and delete tasks, they may not receive adequate support for authentication, authorization, security, performance, intelligent assistance, administration, and deployment. ProTask Manager therefore focuses on the complete application lifecycle, from the user interface and API design to database management, security engineering, caching, artificial intelligence, containerization, and cloud deployment.

The resulting platform provides users with the ability to register, verify their accounts, authenticate securely, create and manage tasks, filter tasks according to several criteria, update their profiles, and use an AI assistant to transform simple task ideas into structured and actionable specifications. Administrators receive additional capabilities for managing users, roles, account status, and administrative information.

A major engineering principle throughout the project is defense in depth. Instead of relying on one security mechanism, the application combines JWT authentication, password hashing, role-based authorization, input validation, XSS sanitization, HTTP Parameter Pollution protection, Helmet security headers, CORS configuration, rate limiting, secure cookies, and centralized error handling. This layered model helps ensure that if one security control is bypassed, additional controls remain available to reduce the impact.

The project was also designed with resilience in mind. Redis is treated as a performance-enhancing service rather than an absolute dependency, allowing an in-memory cache fallback when necessary. Similarly, the AI assistant includes a fallback generation strategy so that the application can still provide structured task assistance when the Gemini service or API credentials are unavailable. The final system was validated locally and through a Google Cloud deployment, with screenshots documenting the principal workflows.

## 2. Problem Statement

Modern users and teams need more than a simple list of tasks. A practical task management platform must support secure identity management, ownership, task organization, filtering, administrative governance, performance, and increasingly intelligent assistance. At the same time, the system must protect sensitive information and remain maintainable as the number of users and tasks increases.

The problem addressed by ProTask Manager can therefore be summarized as follows:

**How can a task management platform provide a simple and responsive user experience while integrating strong security, persistent storage, caching, AI assistance, administration, and cloud deployment capabilities?**

The project addresses this problem through a layered architecture. The frontend is responsible for presentation and user interaction, while the Express backend exposes REST APIs and applies security and validation middleware before requests reach business logic. MongoDB provides persistent storage, Redis provides caching, and Google Gemini provides optional AI capabilities. Docker and Nginx provide deployment-oriented infrastructure, while Google Cloud provides a practical cloud execution environment.

## 3. Objectives

The project was developed around several functional, technical, and non-functional objectives.

The primary functional objectives were to implement secure user registration and login, email verification, task creation and management, filtering, user profile management, administrative user management, and AI-powered task assistance.

The technical objectives were to use modern full-stack technologies and apply software engineering principles such as separation of concerns, modularity, RESTful API design, database abstraction, authentication middleware, validation, caching, and production deployment.

The non-functional objectives focused on security, performance, reliability, maintainability, scalability, and usability. The platform should remain understandable to developers, responsive to users, and resilient when optional infrastructure services are temporarily unavailable.

## 4. Requirements and Functional Scope

The application supports several categories of functionality.

### 4.1 Authentication and Identity

Users can register using validated account information. Passwords are never intentionally stored in plain text; they are protected using bcrypt hashing. The registration process includes email verification through verification tokens and OTP-based verification. Once authenticated, users receive JWT-based authentication that is used to access protected resources.

The system also checks whether an account is banned. This prevents a previously authorized user whose account has been administratively disabled from continuing to access protected functionality.

### 4.2 Task Management

The core functionality is task management. Users can create, view, update, and delete tasks. A task can contain a title, description, status, priority, category, due date, ownership information, and assignment information.

The supported status model includes pending, in-progress, and completed states. Priority can be low, medium, or high. Categories allow users to organize work according to their own operational needs.

Task filtering is another important feature. Users can filter tasks by status, priority, and category, making the system useful even when the number of tasks increases.

### 4.3 Administration

Administrators have additional privileges that standard users do not possess. The administrative interface supports user management, role changes, account banning and unbanning, password management, user deletion, and administrative statistics.

This functionality is protected through role-based access control. Authentication alone is therefore insufficient to access administrative endpoints; the authenticated account must also have the administrator role.

### 4.4 AI Assistance

The AI Task Assistant allows users to generate richer task specifications from simple ideas. Instead of writing only a title such as "Implement authentication," the user can request an AI-generated description containing context, deliverables, acceptance criteria, subtasks, estimated completion time, and suggested tags.

Several writing styles are supported, including actionable, detailed, concise, user story, bug report, and technical modes. Existing task descriptions can also be refined.

## 5. Technology Stack

The frontend uses React 19 with Vite for development and production bundling. Tailwind CSS provides responsive styling, Motion provides interface animations, Lucide React provides icons, Axios manages HTTP communication, and React Markdown renders structured Markdown content.

The backend is implemented with Node.js and Express. Mongoose provides MongoDB integration. JWT is used for authentication, bcryptjs protects passwords, Nodemailer handles email delivery, and express-validator provides input validation.

Security-related dependencies include Helmet, CORS, express-rate-limit, HPP, XSS sanitization, cookie-parser, and Express Session. Redis is integrated through ioredis. Google Gemini is accessed through the Google GenAI tooling for AI functionality.

Infrastructure includes Docker, Docker Compose, and Nginx. The project is also prepared for Google Cloud deployment.

## 6. System Architecture

ProTask Manager follows a layered architecture.

```text
User Browser
     |
     v
React + Vite Frontend
     |
     | Axios / REST
     v
Express.js API
     |
     +-- Authentication
     +-- Authorization
     +-- Validation
     +-- XSS Sanitization
     +-- Rate Limiting
     +-- Controllers
     |
     +----------+-------------+
     |          |             |
     v          v             v
 MongoDB      Redis       Gemini AI
 Users/Tasks  Cache       AI Assistant
```

This architecture separates responsibilities and reduces coupling. Frontend components do not directly access MongoDB. Instead, they communicate with backend services through HTTP APIs. Backend controllers operate on validated requests and use Mongoose models for persistence.

The architecture also makes future scaling easier. Additional application instances can be placed behind a load balancer while MongoDB and Redis are maintained as shared infrastructure.

## 7. Frontend Architecture

The React frontend is organized around reusable components. Authentication components include Login, Register, and EmailVerification. Task functionality is separated into TaskForm, TaskList, TaskDetailModal, and TaskStats. Administrative capabilities are represented by AdminPanel, while AiTaskAssistant provides the AI workflow.

The application also contains Settings, About, Contact, and Logo components. LanguageContext provides shared language-related state, while dedicated service modules separate API, authentication, and AI communication from visual components.

This component-based architecture improves maintainability because functionality can be modified independently. It also supports a consistent interface and responsive design through Tailwind CSS.

## 8. Backend Architecture

The backend follows a modular route-controller-model structure.

Routes define API endpoints and determine which middleware and controllers should process requests. Controllers implement domain-specific operations. Models define MongoDB schemas and relationships. Middleware implements cross-cutting security and validation concerns.

The server contains separate modules for database and Redis configuration. Controllers are divided into user, task, and AI responsibilities. Middleware modules handle authentication, validation, error handling, and XSS sanitization.

The main API namespaces are:

```text
/api/users
/api/tasks
/api/ai
/api/cache
/api/health
```

A health endpoint is particularly useful for deployment and operational verification because it allows infrastructure to determine whether the application is responding correctly.

## 9. Database Design

MongoDB is the primary persistence layer. The User model stores identity and account information, including name, email, password hash, role, verification state, ban state, verification tokens and timestamps.

The Task model stores task-specific information such as title, description, status, priority, category, due date, user ownership, assignment information, creator information, and timestamps.

Relationships are represented using MongoDB ObjectId references. This allows tasks to be associated with users and assigned users without duplicating complete user documents.

The use of Mongoose provides schema validation, middleware, and a structured programming interface while retaining the flexibility of MongoDB's document model.

## 10. Authentication and Authorization

Authentication is implemented using JSON Web Tokens. The authentication middleware can obtain a token from supported request locations such as an Authorization Bearer header or cookies. The token is verified before protected operations are executed.

After token verification, the application retrieves the associated user and checks whether the account is banned. The password field is excluded when user information is retrieved for authentication purposes.

Authorization is implemented separately from authentication. The admin middleware checks the authenticated user's role before administrative operations are allowed. This separation is important because knowing who a user is does not automatically mean that the user is authorized to perform every operation.

Passwords are protected using bcryptjs. Verification tokens and OTP information are also subject to expiration, reducing the risk of indefinitely valid verification credentials.

## 11. Defense-in-Depth Security

Security is one of the strongest aspects of the project. The application follows a defense-in-depth approach by combining several independent controls.

Helmet configures security-related HTTP headers. CORS controls cross-origin communication. Rate limiting reduces the risk of brute-force and abusive traffic. Authentication endpoints receive stricter rate limiting than ordinary API traffic.

HTTP Parameter Pollution protection is implemented through HPP. XSS sanitization recursively processes request body, query, and route parameters. Express Validator validates expected formats and constraints before controller execution.

JWT authentication protects private endpoints, while role-based authorization protects administrative endpoints. Bcrypt protects stored passwords. Secure cookies use HttpOnly and production-aware Secure and SameSite settings.

Centralized error handling provides a consistent mechanism for application failures and reduces the likelihood of uncontrolled errors exposing internal implementation information.

These controls are complementary. For example, an attacker attempting to compromise an authentication endpoint may encounter rate limiting, input validation, sanitization, password hashing, JWT verification, and account-state checks. No individual mechanism is treated as sufficient on its own.

## 12. Redis Caching and Performance

Redis is integrated as a caching layer to reduce repeated database operations and improve response performance. The cache system tracks keys, hits, misses, total requests, and hit ratio.

Task-related data can be cached for a limited time. Cache invalidation is important because stale task information could otherwise be displayed after updates or deletions. The application therefore provides cache management capabilities including statistics, testing, and flushing.

A notable design decision is that Redis is not treated as the only possible execution path. When Redis is unavailable, an in-memory fallback cache can be used. This improves development resilience and prevents an optional performance service from becoming an immediate single point of failure.

Nginx also contributes to performance through compression and static asset caching.

## 13. AI-Powered Task Assistant

The AI Task Assistant integrates Google Gemini into the task creation process. The purpose is not simply to add a chatbot, but to solve a concrete productivity problem: transforming vague task ideas into structured work specifications.

The assistant can generate descriptions, acceptance criteria, subtasks, estimated completion time, and suggested tags. Different writing styles allow the same task to be adapted to different contexts, such as a technical implementation, bug report, user story, or concise action item.

The AI functionality is exposed through dedicated backend endpoints. This keeps the API key and provider logic away from the browser and provides a clean boundary between the application and the external AI service.

The project also includes a fallback strategy. If Gemini is unavailable or no API key is configured, structured local templates can generate useful task content. This demonstrates an important engineering principle: external AI services should enhance the platform without making its core workflow completely dependent on external availability.

## 14. API Design

The REST API is organized around domain resources.

User endpoints include registration, login, logout, email verification, profile retrieval, profile updates, password updates, and contact operations.

Task endpoints provide retrieval, creation, modification, and deletion.

Administrative endpoints support user listing, statistics, role changes, banning, password management, and deletion.

AI endpoints support description generation and refinement.

Cache endpoints expose statistics, flushing, and testing.

This structure provides a predictable API contract and makes frontend integration easier.

## 15. Deployment and Infrastructure

The project supports both development and production-oriented execution.

During development, Vite provides the frontend development experience while Express serves the backend and integrates the application. The production build compiles the frontend and bundles the server.

Docker Compose provides container-oriented deployment. Nginx operates as a reverse proxy and can handle forwarded headers, compression, static asset caching, and WebSocket upgrade behavior.

The application was also deployed using Google Cloud. The repository contains screenshots showing the successfully deployed web application and major workflows. This demonstrates that the system can move beyond a local development environment into a cloud-hosted execution environment.

Production secrets such as MongoDB credentials, JWT secrets, session secrets, cookie secrets, SMTP credentials, and Gemini API keys should be supplied through environment variables or managed secret infrastructure rather than stored in source control.

## 16. Validation and Testing

Validation focused on complete user journeys rather than isolated screens.

The authentication workflow was verified through registration, email verification, login, and access to authenticated functionality. Task workflows were validated through creation, viewing, updating, deletion, and filtering by status, priority, and category.

Administrative functionality was validated through the administration interface and user management operations. The AI workflow was checked through task description generation and refinement.

Infrastructure validation included running the application locally and verifying the deployed application in Google Cloud. The repository's screenshot collection provides visual evidence for these workflows.

Although the project provides strong functional validation, a future version should expand automated unit, integration, and end-to-end test coverage.

## 17. Challenges and Engineering Decisions

One important challenge was ensuring that optional infrastructure services did not make the application fragile. Redis was therefore implemented with an in-memory fallback.

Another challenge was implementing authentication securely. The solution required more than issuing JWTs: password hashing, email verification, account status checks, cookie/session handling, role authorization, and input validation all needed to work together.

Input security was another challenge because user-controlled data can arrive through several request locations. Recursive sanitization combined with schema validation provides multiple layers of protection.

AI integration introduced a separate reliability challenge. External AI APIs can fail because of missing credentials, quota limits, network problems, or provider availability. The fallback task-generation mechanism therefore ensures that the application's productivity feature remains usable.

Finally, deployment required transforming a development-oriented application into a production-ready system. Docker, Nginx, environment configuration, production builds, health checks, and cloud deployment were included to address this challenge.

## 18. Results

The final project successfully combines the main objectives into one coherent platform. Users can authenticate securely, manage tasks, filter work, update their profiles, and receive AI-assisted task specifications. Administrators can manage users and roles.

From a security perspective, the platform demonstrates defense in depth through multiple controls rather than depending on a single authentication mechanism.

From a performance perspective, Redis caching and Nginx optimization provide a foundation for handling increased workloads.

From a deployment perspective, Docker and Google Cloud compatibility demonstrate that the application can operate beyond the local development environment.

From a software engineering perspective, the project demonstrates practical experience with frontend architecture, REST APIs, database modeling, authentication, cybersecurity, caching, artificial intelligence, containerization, and cloud deployment.

## 19. Limitations and Future Improvements

The current version can be improved with automated testing, stronger observability, centralized logging, metrics, distributed tracing, and alerting.

Authentication could be extended with OAuth providers, password-reset workflows, and stronger multi-factor authentication. Real-time collaboration could be introduced using WebSockets. Background job processing could be used for email and AI requests.

The task system could evolve to support recurring tasks, dependencies, file attachments, calendar integration, team workspaces, notifications, and advanced productivity analytics.

For larger deployments, MongoDB and Redis should be provided through managed or clustered infrastructure. The application could also be deployed behind a load balancer with multiple Node.js instances.

AI functionality could evolve into intelligent prioritization, deadline recommendations, task decomposition, productivity analysis, and personalized planning.

A CI/CD pipeline using GitHub Actions or another automation platform would further improve deployment consistency.

## 20. Conclusion

ProTask Manager demonstrates the development of a complete intelligent web platform using modern software engineering practices. It combines a React/Vite frontend with an Express/Node.js backend, MongoDB persistence, Redis caching, JWT authentication, role-based authorization, email verification, AI assistance, security middleware, Docker, Nginx, and Google Cloud deployment.

The project's main strength is its integration of multiple engineering concerns into one coherent architecture. The application is not limited to CRUD operations; it addresses authentication, authorization, security, performance, resilience, artificial intelligence, administration, and deployment.

The defense-in-depth model provides multiple layers of protection, while Redis and AI fallback mechanisms improve resilience. The component-based frontend and modular backend improve maintainability. Docker, Nginx, and cloud deployment provide a practical path toward production operation.

The project therefore provides a strong demonstration of full-stack software engineering combined with cybersecurity, database management, AI integration, DevOps, and cloud technologies. It also provides a foundation for future enterprise features such as real-time collaboration, automated testing, observability, multi-tenant architecture, advanced AI productivity services, and horizontal scalability.

The most important conclusion is that ProTask Manager represents an end-to-end engineering solution: a real user problem was translated into functional requirements, implemented through a layered architecture, protected with multiple security controls, enhanced through AI and caching, and finally prepared and validated for cloud deployment.
