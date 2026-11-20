🌍 ImpactHub

Student Project & Volunteer Management Platform

ImpactHub is a full-stack web application designed to connect Students with meaningful projects and volunteer opportunities. The platform provides a centralized system where students can discover projects, apply to participate, complete assigned tasks, and submit their work.

The application includes a complete role-based system with three main user roles:

- 👑 Admin
- 👨‍💼 Manager
- 🎓 Student

ImpactHub uses a real Frontend + Backend + REST API + MongoDB database architecture.

---

🚀 How to Run the Project

💻 Run Frontend

In one terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Keep this terminal running.

---

⚙️ Run Backend

In a second terminal, start the project API:

```bash
cd backend
npm install
npm run dev
```

`npm run dev` starts `server.js`, connects to the MongoDB database configured by `MONGO_URI`, and serves the API on port 5000. Keep this terminal running alongside the frontend: the Discover page loads projects from this API and MongoDB. If the backend is stopped, the page cannot load projects. The `dev` command runs Node directly so it works in restricted Windows environments where nodemon cannot spawn its watcher. The separate `index.js` file is an older shop API and is not used by this frontend.

---

🛠️ Technology Stack

Frontend

- HTML5
- CSS3
- JavaScript
- Modern frontend development tools

Backend

- Node.js
- Express.js
- RESTful APIs

Database

- MongoDB Atlas
- MongoDB Compass

Authentication & Security

- JWT Authentication
- Password Hashing
- bcrypt
- Role-Based Authorization

---

🗄️ Database

This project uses MongoDB Atlas as the cloud database.

The MongoDB database can also be accessed and managed using MongoDB Compass.

The application backend is connected to MongoDB through the MongoDB connection configuration.

User Roles

The following roles are assigned to users in the MongoDB database:

Admin
Manager
Student

Role-based authorization ensures that every user can access only the features and actions allowed for their role.

«⚠️»

---

👑 Admin Features

The Admin is responsible for managing and controlling the overall platform.

Admin can:

- 👥 Manage users
- 🔐 Manage user roles
- 👨‍💼 Manage Managers
- 🎓 Manage Students
- 📁 Manage projects
- ✅ Approve projects
- ❌ Reject projects when necessary
- 📊 Monitor platform activities
- 🔔 Manage platform-level notifications
- 📈 View platform information and analytics
- 🛡️ Control and moderate the system

Admin Workflow

Manager Creates Project
        ↓
Admin Reviews Project
        ↓
Approve / Reject
        ↓
Approved Project Becomes Available

---

👨‍💼 Manager Features

The Manager manages projects, student applications, and project tasks.

Manager can:

- ➕ Create projects
- 📂 Manage their own projects
- 👀 View student applications
- ✅ Approve student applications
- ❌ Reject student applications
- 👥 Manage approved project members
- 📋 Create and assign tasks
- 📅 Set task deadlines
- 📊 Monitor task progress
- 📥 Review student submissions
- 💬 Communicate and collaborate with project members

Manager Workflow

Create Project
      ↓
Admin Approves Project
      ↓
Students Apply
      ↓
Manager Reviews Applications
      ↓
Approve Students
      ↓
Assign Tasks
      ↓
Students Complete Tasks
      ↓
Students Submit Work
      ↓
Manager Reviews Submission

---

🎓 Student Features

Students can discover projects and actively participate in them.

Student can:

- 🔐 Register and log in
- 👤 Manage their profile
- 🔎 Browse available projects
- 📄 View project details
- 📝 Apply for projects
- 📊 Check application status
- 👥 Join approved projects
- 📋 View assigned tasks
- ⏳ Track task deadlines
- 📤 Submit completed work
- 🔔 Receive notifications
- 💬 Participate in project communication
- 🏆 View achievements and progress

Student Workflow

Register / Login
      ↓
Browse Projects
      ↓
Apply to Project
      ↓
Manager Reviews Application
      ↓
Application Approved
      ↓
Student Joins Project
      ↓
Manager Assigns Task
      ↓
Student Completes Task
      ↓
Student Submits Work
      ↓
Manager Reviews Submission

---

🔄 Complete System Workflow

ImpactHub provides a complete workflow between all three roles.

                 👑 ADMIN
                    │
          Approves / Manages Projects
                    │
                    ▼
              👨‍💼 MANAGER
                    │
              Creates Project
                    │
                    ▼
             🎓 STUDENTS APPLY
                    │
                    ▼
        Manager Approves Students
                    │
                    ▼
             Students Join Project
                    │
                    ▼
            Manager Assigns Tasks
                    │
                    ▼
          Students Complete Tasks
                    │
                    ▼
          Students Submit Their Work
                    │
                    ▼
         Manager Reviews Submission
                    │
                    ▼
              ✅ TASK COMPLETED

---

🔐 Authentication System

ImpactHub implements authentication and authorization.

The authentication system includes:

- User registration
- User login
- Password hashing
- JWT tokens
- Protected routes
- Role-based authorization

The system restricts access according to the user's role.

Example

Admin    → Platform Management
Manager  → Project & Task Management
Student  → Project Participation & Task Submission

---

📡 REST API

The backend provides REST APIs for communication between the frontend and backend.

The APIs handle functionality such as:

- Authentication
- Users
- Roles
- Projects
- Applications
- Project members
- Tasks
- Submissions
- Notifications
- Comments
- Dashboard data

The frontend communicates with the backend through these APIs.

---

🧪 Testing

The project should be tested before submission.

Testing includes:

- ✅ Frontend functionality
- ✅ Backend APIs
- ✅ Database connection
- ✅ Authentication
- ✅ Role authorization
- ✅ Project creation
- ✅ Project approval
- ✅ Student applications
- ✅ Application approval/rejection
- ✅ Task assignment
- ✅ Task submission
- ✅ Complete workflow

API endpoints can be tested using Thunder Client.

---

📁 Project Structure

ImpactHub
│
├── Frontend
│   ├── Components
│   ├── Pages
│   ├── Services
│   └── Application UI
│
├── Backend
│   ├── Controllers
│   ├── Models
│   ├── Routes
│   ├── Middleware
│   └── Server Configuration
│
└── README.md

---

⚙️ Environment Variables

Create a ".env" file in the backend folder.

Example:

MONGO_URI=mongodb://127.0.0.1:27017/impacthub
JWT_SECRET=your_jwt_secret
PORT=5000

The backend reads `MONGO_URI` (not `MONGODB_URI`). For MongoDB Atlas, replace the local URI with your Atlas connection string. Create `backend/.env` from `backend/.env.example`; never commit real credentials. The API health endpoint is `http://localhost:5000/api/health`.



---

🌟 Key Features

- ✅ Full-stack application
- ✅ Separate frontend and backend
- ✅ REST API architecture
- ✅ MongoDB database
- ✅ MongoDB Atlas integration
- ✅ MongoDB Compass support
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Role-based authorization
- ✅ Admin dashboard/features
- ✅ Manager dashboard/features
- ✅ Student dashboard/features
- ✅ Project management
- ✅ Student applications
- ✅ Application approval and rejection
- ✅ Project membership
- ✅ Task assignment
- ✅ Task tracking
- ✅ Student submissions
- ✅ Notifications
- ✅ Comments and collaboration
- ✅ Analytics and dashboard functionality

---

🎯 Problem Solved

Students often struggle to find meaningful projects and volunteer opportunities where they can gain practical experience.

ImpactHub solves this problem by providing a platform where:

- 🎓 Students can discover and apply for projects.
- 👨‍💼 Managers can create and manage projects.
- 👑 Administrators can monitor and control the platform.

This creates a complete ecosystem for project collaboration, volunteer management, and student skill development.

---

🏆 Hackathon Project

ImpactHub was developed as a full-stack hackathon project.

The project demonstrates practical implementation of:

- Frontend Development
- Backend Development
- REST APIs
- Database Integration
- Authentication
- Authorization
- Role-Based Access Control
- Project Management Workflows

---

👨‍💻 Developer

Ahmed Sulman

Full-Stack Web Development Project

---

⭐ Final Project Highlights

🔥 Real Frontend and Backend Communication

🗄️ MongoDB Atlas Database Integration

🧭 Database Accessible Through MongoDB Compass

🔐 JWT Authentication and Secure Password Hashing

👑 Admin Role

👨‍💼 Manager Role

🎓 Student Role

📋 Complete Project → Application → Approval → Task → Submission Workflow

🧪 API Testing with Thunder Client

🚀 A Complete Full-Stack Student Project & Volunteer Management Platform

---

⭐ If you like this project, please consider giving the repository a star!

