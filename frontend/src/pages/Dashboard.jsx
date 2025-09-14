import React, { useEffect, useState } from "react";
import API from "../api/axios";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ConnectionBadge from "../components/ConnectionBadge";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";   // ✅ add this
import "react-toastify/dist/ReactToastify.css";           // ✅ add this

export default function Dashboard() {
  const { token, logout } = useAuth();
  const token1 = localStorage.getItem("access_token")
  const userId1 = localStorage.getItem("current_user")
  const { socket, connected } = useSocket(token1)

  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [completed, setCompleted] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const fetch = async (params = {}) => {
    setLoading(true);
    try {
      const res = await API.get("/tasks/", { params });
      setTasks(res.data);
    } catch (e) {
      toast.error("❌ Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

 useEffect(() => {
    if (!socket) return

  socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📩 WS event:", data)
        console.log("👤 Current user ID:", userId1)
        console.log("👤 Event user ID:", data.user_id)
        if (data.user_id == userId1) return; 
        if (data.event === "task_created") {
          setTasks((prev) => [...prev, data.task])
          toast.info(`New Task added: ${data.task.title}`)
        } else if (data.event === "task_updated") {
          setTasks((prev) =>
            prev.map((t) => (t.id === data.task.id ? data.task : t))
          )
          toast.info(`Task updated: ${data.task.title}`)
        } else if (data.event === "task_deleted") {
          toast.info(`Task deleted: ${data.task_id}`)
          setTasks((prev) => prev.filter((t) => t.id !== data.task_id))

        }
      } catch (err) {
        console.error("WS parse error", err)
      }
    }
  }, [socket])

  const handleFilter = () => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    params.status = completed ;

    fetch(params);
    toast.info("🔍 Filter applied");
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/login"); // ✅ avoids offline flash
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📋 Task Manager</h2>
        <div className="d-flex align-items-center gap-3">
          {token && <ConnectionBadge connected={connected} />}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Task Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <TaskForm
            onCreated={() => {
              fetch();
              toast.success("✅ Task created successfully!");
            }}
            editingTask={editingTask}
            onUpdated={() => {
              setEditingTask(null);
              fetch();
              toast.success("✏️ Task updated successfully!");
            }}
            onCancelEdit={() => setEditingTask(null)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap gap-2">
          <input
            className="form-control"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <select
            className="form-select"
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
          >
            <option value="all">All</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Completed</option>
          </select>
          <button className="btn btn-primary" onClick={handleFilter}>
            Filter
          </button>
          <button className="btn btn-secondary" onClick={() => fetch()}>
            Clear
          </button>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-5">⏳ Loading tasks...</div>
      ) : (
        <TaskList
          tasks={tasks}
          onChange={() => {
            fetch();
          }}
          onEdit={(task) => setEditingTask(task)}
        />
      )}

      {/* ✅ Toast Container at bottom */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}