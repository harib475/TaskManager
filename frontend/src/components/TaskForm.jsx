import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function TaskForm({ onCreated, editingTask, onUpdated, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Fill form if editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setCategory(editingTask.category || "");
      setDueDate(editingTask.due_date || "");
      setPriority(editingTask.priority || "");
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setDueDate("");
    setPriority("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTask) {
        // 🔄 Update Task
        await API.put(`/tasks/${editingTask.id}`, {
          title,
          description,
          category,
          due_date: dueDate || null,
          priority: priority || null,
        });
        toast.success("✏️ Task updated successfully!");
        onUpdated();
      } else {
        // ➕ Create Task
        await API.post("/tasks/", {
          title,
          description,
          category,
          due_date: dueDate || null,
          priority: priority || null,
        });
        toast.success("✅ Task created successfully!");
        resetForm();
        onCreated();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "❌ Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="row g-2">
      <div className="col-md-6">
        <input
          className="form-control"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="col-md-6">
        <input
          className="form-control"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div className="col-md-12">
        <textarea
          className="form-control"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="col-md-12 d-flex gap-2 mt-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}