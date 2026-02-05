import { useState, useEffect } from "react";
import { addSession, updateSession, getCourses } from "../../services/storageService";
import { processNotes } from "../../services/aiService";
import "./sessionPage.css";

function SessionPage({ courseId, onBack, onNavigateToStudyBank }) {
  // 1. Initial form state
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionNotes, setNewSessionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [courses] = useState(() => getCourses());
  const [selectedCourseId, setSelectedCourseId] = useState(courseId);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleAddSession = async (e) => {
    e.preventDefault();
    
    const title = newSessionTitle.trim();
    const notes = newSessionNotes.trim();

    if (!title || !notes) return;

    try {
      // 2. Save raw session to storage immediately (Offline-first)
      const session = addSession(selectedCourseId, title, {
        rawNotes: notes,
        aiStatus: isOnline ? "processing" : "pending"
      });

      // 3. Clear form and provide feedback
      setNewSessionTitle("");
      setNewSessionNotes("");
      if (!isOnline) {
        setSuccessMessage(`"${title}" saved offline. We'll process it when you're back online.`);
        setIsProcessing(false);
        setTimeout(() => setSuccessMessage(""), 5000);
        return;
      }

      setIsProcessing(true);
      setSuccessMessage(`"${title}" saved. AI is processing in the background.`);

      // 4. Background AI Processing
      // We don't "await" this for the UI to clear, so the user can add another note immediately
      processNotes(notes)
        .then((result) => {
          if (result) {
            updateSession(selectedCourseId, session.id, {
              aiOutput: result,
              aiStatus: "done"
            });
          } else {
            updateSession(selectedCourseId, session.id, { aiStatus: "pending" });
          }
        })
        .catch(() => {
          updateSession(selectedCourseId, session.id, { aiStatus: "pending" });
          setSuccessMessage(`"${title}" saved. AI will retry when you're back online.`);
        })
        .finally(() => setIsProcessing(false));

      // Auto-hide success message
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (error) {
      console.error("Save Error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="sessionPage">
      <header className="pageHeader">
        <button className="backBtn" onClick={onBack}>
          ← Dashboard
        </button>
      </header>

      <main className="sessionMain">
        <div className="formWrapper">
          <div className="pageTitle">
            <h1>Transform Your Notes</h1>
            <p>Source your lecture notes below and let AI create structured study materials with glossaries, summaries, and memory links.</p>
            {!isOnline && (
              <div className="offlineBadge">
                <span className="offlineDot"></span>
                Offline mode
              </div>
            )}
          </div>

          {successMessage && (
            <div className="successBanner">
              <div className="bannerContent">
                <span className="checkIcon">✓</span>
                <p>{successMessage}</p>
              </div>
              <button className="bannerAction" onClick={onNavigateToStudyBank}>View in Study Bank</button>
            </div>
          )}

          <form onSubmit={handleAddSession} className="noteForm">
            <div className="formGroup">
              <label htmlFor="course-select">Select Course <span className="required">*</span></label>
              <p className="fieldHint">Choose the course for this session</p>
              <select 
                id="course-select"
                className="formSelect"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="session-title">Session Title <span className="required">*</span></label>
              <p className="fieldHint">Give this session a descriptive title</p>
              <input
                id="session-title"
                type="text"
                placeholder="e.g., Lecture 5: Data Structures and Algorithms"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                className="formInput"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="session-notes">Lecture Notes <span className="required">*</span></label>
              <p className="fieldHint">Paste or type your lecture notes here... Include key concepts, definitions, examples, and important points discussed in class.</p>
              <textarea
                id="session-notes"
                placeholder="Paste or type your lecture notes here... Include key concepts, definitions, examples, and important points discussed in class."
                value={newSessionNotes}
                onChange={(e) => setNewSessionNotes(e.target.value)}
                className="formTextarea"
                rows="12"
                required
              />
            </div>

            <button 
              type="submit" 
              className={`submitBtn ${isProcessing ? 'loading' : ''}`}
              disabled={!newSessionTitle.trim() || !newSessionNotes.trim()}
            >
     
              {isProcessing ? "Processing..." : "Add note"}
            </button>
          </form>

          <section className="proTipSection">
            <div className="proTipIcon">💡</div>
            <div className="proTipContent">
              <h3>Pro Tip</h3>
              <p>Include key concepts, definitions, examples, and important points from your lectures. The more detailed your notes, the better your study materials will be.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SessionPage;