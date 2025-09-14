# 📝 Task Manager

A comprehensive task management application designed to streamline task creation, tracking, and collaboration.

Built with **FastAPI** for the backend and **React (JavaScript)** for the frontend, this app delivers a seamless and efficient task management experience.

---

## 🚀 Features

- **User Authentication**  
  Secure registration and login using JWT tokens.

- **Task Management**  
  Create, update, delete, and filter tasks by category or completion status.

- **Real-Time Updates**  
  WebSocket integration enables real-time task updates across connected clients.

- **Responsive UI**  
  A modern, responsive, and user-friendly frontend.

---

## 🧰 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| **Backend**   | FastAPI, SQLAlchemy, Passlib, JWT         |
| **Frontend**  | JavaScript (React) with Bootstrap         |
| **Database**  | SQLite (via SQLAlchemy ORM)               |
| **Auth**      | JWT (JSON Web Tokens)                     |
| **Realtime**  | WebSockets                                |

---

## ⚙️ Installation

### 🔁 Clone the Repository

```bash
    git clone https://github.com/harib475/Task_Manager.git
    cd Task_Manager
```

🛠️ Backend Setup
1. Create a Virtual Environment
2. Install Dependencies
3. Run the Backend Server

```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use: venv\Scripts\activate
    pip install -r backend/requirements.txt
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```


🌐 Frontend Setup
1. Navigate to the Frontend Directory
2. Install Dependencies
3. Run the Frontend Application

```bash
    cd frontend
    npm install
    npm run dev
```

By default:

Frontend: http://localhost:5173

Backend: http://localhost:8000

📦 Usage
🔐 Authentication

## Register
POST /auth/register
Submit user details to register.

## Login
POST /auth/login
Obtain a JWT token for authenticated requests.

## ✅ Task Operations

## Create Task
    POST /tasks/
    Provide task details.

## Update Task
    PUT /tasks/{task_id}
    Provide updated task info.

## Delete Task
    DELETE /tasks/{task_id}

## Filter Tasks
    Use query params:
    ?title=...&description=...&category=...&status=...

🔄 Real-Time Updates

This app supports live task updates using WebSockets.

    Connect to:
    ws://localhost:8000/ws/tasks