import React from "react";
import API from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";

export default function TaskList({ tasks = [], onChange, onEdit }) {
  const toggle = async (id, current, body, title) => {
    try {
      await API.put(`/tasks/${id}`, { completed: !current, body, title });
      toast.info(`✅ Task marked as ${current ? "Incomplete" : "Complete"}`);
      onChange();
    } catch (e) {
      toast.error("❌ Failed to update task status");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success("🗑️ Task deleted");
      onChange();
    } catch (e) {
      toast.error("❌ Failed to delete task");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const newList = Array.from(tasks);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);
    const payload = newList.map((t, i) => ({ id: t.id, position: i }));

    try {
      await API.post("/tasks/reorder", { items: payload });
      toast.success("🔄 Tasks reordered");
      onChange();
    } catch (e) {
      toast.error("❌ Failed to reorder");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "20%" }}>Title</th>
                  <th style={{ width: "35%" }}>Description</th>
                  <th style={{ width: "15%" }}>Category</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "15%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((t, idx) => (
                    <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                      {(prov) => (
                        <tr
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <td>{idx + 1}</td>
                          <td>{t.title}</td>
                          <td>{t.description || "—"}</td>
                          <td>{t.category || "General"}</td>
                          <td>
                            {t.completed ? (
                              <span className="badge bg-success">Complete</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Incomplete
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${
                                t.completed
                                  ? "btn-warning me-2"
                                  : "btn-success me-2"
                              }`}
                              onClick={() => toggle(t.id, t.completed,t.body,t.title)}
                            >
                              {t.completed
                                ? "Mark Incomplete"
                                : "Mark Complete"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => onEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => remove(t.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))
                )}
              </tbody>
            </table>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}