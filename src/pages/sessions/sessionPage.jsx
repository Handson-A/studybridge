import { useState } from "react";
import {
  getCourses,
  addSession,
  deleteSession
} from "../../services/storageService";
import "./sessionPage.css";

function SessionPage({ courseId, onBack }) {
  const [newTitle, setNewTitle] = useState("");
  const course = getCourses().find(c => c.id === courseId) || null;

  function handleAddSession() {
    if (!newTitle.trim()) return;

    addSession(courseId, newTitle.trim());
    setNewTitle("");
  }

  function handleDeleteSession(sessionId) {
    deleteSession(courseId, sessionId);
  }

  if (!course) return null;

  return (
    <section className="sessionsPage">
      <button className="backBtn" onClick={onBack}>← Courses</button>

      <h2>{course.title}</h2>

      <div className="sessionInput">
        <input
          type="text"
          placeholder="New session title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <button onClick={handleAddSession}>Add</button>
      </div>

      {course.sessions.length === 0 ? (
        <p className="emptyText">No sessions yet.</p>
      ) : (
        <ul className="sessionList">
          {course.sessions.map(session => (
            <li key={session.id} className="sessionItem">
              <span>{session.title}</span>
              <button
                className="deleteBtn"
                onClick={() => handleDeleteSession(session.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SessionPage;
