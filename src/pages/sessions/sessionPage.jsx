import { useState } from "react";
import {
  getCourses,
  addSession,
  deleteSession,
  updateSession
} from "../../services/storageService";
import { processNotes } from "../../services/aiService";

import "./sessionPage.css";

function SessionPage({ courseId, onBack }) {
  const [newTitle, setNewTitle] = useState("");
  const [course, setCourse] = useState(
    getCourses().find((c) => c.id === courseId) || null
  );
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("glossary"); // "glossary" | "summary" | "memoryLink"

  // Start editing notes for a session
  function startEditing(session) {
    setEditingSessionId(session.id);
    setEditingNotes(session.rawNotes);
  }

  // Save edited notes
  function saveNotes() {
    if (!editingSessionId) return;

    updateSession(courseId, editingSessionId, { rawNotes: editingNotes });

    const updated = getCourses().find((c) => c.id === courseId);
    setCourse(updated);

    setEditingSessionId(null);
    setEditingNotes("");
  }

  // Add a new session
  function handleAddSession() {
    if (!newTitle.trim()) return;

    addSession(courseId, newTitle.trim());
    const updated = getCourses().find((c) => c.id === courseId);
    setCourse(updated);
    setNewTitle("");
  }

  // Delete a session
  function handleDeleteSession(sessionId) {
    deleteSession(courseId, sessionId);
    const updated = getCourses().find((c) => c.id === courseId);
    setCourse(updated);
  }

  if (!course) return null;

  return (
    <section className="sessionsPage">
      <button className="backBtn" onClick={onBack}>
        ← Courses
      </button>

      <h2>{course.title}</h2>

      {/* Add new session */}
      <div className="sessionInput">
        <input
          type="text"
          placeholder="New session title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={handleAddSession}>Add</button>
      </div>

      {course.sessions.length === 0 ? (
        <p className="emptyText">No sessions yet.</p>
      ) : (
        <ul className="sessionList">
          {course.sessions.map((session) => (
            <li key={session.id} className="sessionItem">
              <span>{session.title}</span>

              {/* Session Actions */}
              <div className="sessionActions">
                <button onClick={() => startEditing(session)}>✎ Edit</button>
                <button
                  className="deleteBtn"
                  onClick={() => handleDeleteSession(session.id)}
                >
                  ×
                </button>
              </div>

              {/* Notes Editor */}
              {editingSessionId === session.id && (
                <div className="notesEditor">
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Enter lecture notes..."
                  />
                  <button onClick={saveNotes}>Save Notes</button>
                </div>
              )}

              {/* AI Processing Button */}
              {editingSessionId === session.id && (
                <div className="aiControls">
                  <button
                    onClick={async () => {
                      setProcessing(true);
                      const result = await processNotes(editingNotes);
                      if (result) {
                        updateSession(courseId, editingSessionId, { aiOutput: result });
                        setAiOutput(result);
                      }
                      setProcessing(false);
                    }}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Generate AI Output"}
                  </button>
                </div>
              )}

              {/* AI Output Tabs */}
              {aiOutput && (
                <div className="aiTabs">
                  <div className="tabButtons">
                    <button onClick={() => setActiveTab("glossary")}>Glossary</button>
                    <button onClick={() => setActiveTab("summary")}>Summary</button>
                    <button onClick={() => setActiveTab("memoryLink")}>Memory Link</button>
                  </div>

                  <div className="tabContent">
                    {activeTab === "glossary" && (
                      <ul>
                        {aiOutput.glossary?.map((g, i) => (
                          <li key={i}>
                            <strong>{g.term}</strong>: {g.definition} (Usage: {g.usage})
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === "summary" && (
                      <ol>
                        {aiOutput.summary?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    )}
                    {activeTab === "memoryLink" && <p>{aiOutput.memoryLink}</p>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SessionPage;
