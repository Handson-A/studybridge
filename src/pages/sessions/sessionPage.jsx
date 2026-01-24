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

  // Track which session is being edited
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");

  // AI processing state per session
  const [aiOutputs, setAiOutputs] = useState({}); // { sessionId: outputJSON }
  const [processingId, setProcessingId] = useState(null); // track which session is processing
  const [activeTabs, setActiveTabs] = useState({}); // { sessionId: "glossary" }

  // Start editing notes
  function startEditing(session) {
    setEditingSessionId(session.id);
    setEditingNotes(session.rawNotes);
  }

  // Save notes
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

    // Remove AI state for deleted session
    setAiOutputs((prev) => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });
    setActiveTabs((prev) => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });
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
          {course.sessions.map((session) => {
            const output = aiOutputs[session.id];
            const activeTab = activeTabs[session.id] || "glossary";
            const isProcessing = processingId === session.id;

            return (
              <li key={session.id} className="sessionItem">
                {/* Tabs above content */}
                {output && (
                  <div className="aiTabs">
                    <div className="tabButtons">
                      <button
                        className={activeTab === "glossary" ? "active" : ""}
                        onClick={() =>
                          setActiveTabs((prev) => ({
                            ...prev,
                            [session.id]: "glossary"
                          }))
                        }
                      >
                        Glossary
                      </button>
                      <button
                        className={activeTab === "summary" ? "active" : ""}
                        onClick={() =>
                          setActiveTabs((prev) => ({
                            ...prev,
                            [session.id]: "summary"
                          }))
                        }
                      >
                        Summary
                      </button>
                      <button
                        className={activeTab === "memoryLink" ? "active" : ""}
                        onClick={() =>
                          setActiveTabs((prev) => ({
                            ...prev,
                            [session.id]: "memoryLink"
                          }))
                        }
                      >
                        Memory Link
                      </button>
                    </div>

                    <div className="tabContent">
                      {activeTab === "glossary" && (
                        <ul>
                          {output.glossary?.map((g, i) => (
                            <li key={i}>
                              <strong>{g.term}</strong>: {g.definition} (Usage: {g.usage})
                            </li>
                          ))}
                        </ul>
                      )}
                      {activeTab === "summary" && (
                        <ol>
                          {output.summary?.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      )}
                      {activeTab === "memoryLink" && <p>{output.memoryLink}</p>}
                    </div>
                  </div>
                )}

                {/* Session title & actions */}
                <span>{session.title}</span>
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
                        setProcessingId(session.id);
                        const result = await processNotes(editingNotes);
                        if (result) {
                          updateSession(session.courseId, session.id, { aiOutput: result });
                          setAiOutputs((prev) => ({ ...prev, [session.id]: result }));
                        }
                        setProcessingId(null);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Generate AI Output"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default SessionPage;
