import { useState, useEffect } from "react";
import { getCourses } from "../../services/storageService";
import "./studybankPage.css";

function StudyBankPage({ onBack }) {
  const [courses] = useState(() => getCourses());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  // object to track tabs for each session card independently
  const [activeTabs, setActiveTabs] = useState({});

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

  const setSessionTab = (sessionId, tab) => {
    setActiveTabs(prev => ({ ...prev, [sessionId]: tab }));
  };

  const getSessionTab = (sessionId) => activeTabs[sessionId] || "glossary";



  const renderGlossary = (aiOutput) => {
    const glossary = aiOutput?.glossary || [];
    if (glossary.length === 0) return <div className="emptyContent">No glossary terms available</div>;

    return (
      <div className="glossaryContent">
        <div className="termsList">
          {glossary.map((item, idx) => (
            <div key={idx} className="glossaryItem">
              <div className="termHeader">
                <span className="termLabel">{item.term}</span>
              </div>
              <p className="termDefinition">{item.definition}</p>
              {item.usage && <p className="termUsage"><strong>Example:</strong> {item.usage}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSummary = (aiOutput) => {
    const summary = aiOutput?.summary;
    if (!summary) return <div className="emptyContent">No summary available</div>;

    return (
      <div className="summaryContent">
        {typeof summary === "string" ? (
          <p className="summaryBody">{summary}</p>
        ) : (
          <div className="summaryList">
            {summary.content?.map((point, idx) => (
              <div key={idx} className="summaryPoint">
                <span className="pointNumber">{idx + 1}</span>
                <p className="pointText">{point.text || point}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMemoryLink = (aiOutput) => {
    const links = aiOutput?.memoryLinks || [];
    if (links.length === 0) return <div className="emptyContent">No memory links generated, best advise: revisit slides</div>;

    return (
      <div className="memoryLinkContent">
        <ul className="memoryList">
          {links.map((link, idx) => (
            <li key={idx} className="memoryItem">
              <span className="memoryIcon">💡</span>
              <p>{link}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ===== COURSE LIST VIEW =====
  const renderCourseListView = () => {
    const courseStudyBanks = courses.map(course => {
      const completedSessions = course.sessions?.filter(s => s.aiOutput) || [];
      const pendingSessions = course.sessions?.filter(s => !s.aiOutput && s.aiStatus === "pending") || [];

      return {
        ...course,
        completedCount: completedSessions.length,
        pendingCount: pendingSessions.length
      };
    });

    const hasAnySessions = courseStudyBanks.some(c => c.completedCount > 0 || c.pendingCount > 0);

    return (
      <div className="studybankPage">
        <header className="studybankNav">
          <button className="backBtn" onClick={onBack}>← Dashboard</button>
          <h1>Study Bank</h1>
        </header>

        {!isOnline && (
          <div className="offlineBanner">
            <span className="statusDot offline"></span>
            <p>Offline Mode</p>
          </div>
        )}

        {hasAnySessions ? (
          <div className="coursesGrid">
            {courseStudyBanks.map(course => (
              <div
                key={course.id}
                className="courseStudyCard"
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="cardContent">
                  <p className="courseStudyCode">{course.code}</p>
                  <h3 className="courseStudyTitle">{course.title}</h3>
                  
                  
                  <div className="statsGrid">
                    <div className="statBox">
                      <span className="statNumber">{course.completedCount}</span>
                      <span className="statLabel">Study Materials → </span>
                    </div>
                    {course.pendingCount > 0 && (
                      <div className="statBox pending">
                        <span className="statNumber">{course.pendingCount}</span>
                        <span className="statLabel">Processing</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="emptyState">
            <div className="emptyIcon">📚</div>
            <h2>Your Bank is Empty</h2>
            <p>Add notes in a session to generate study materials.</p>
          </div>
        )}
      </div>
    );
  };

  // ===== COURSE STUDY BANK VIEW =====
  const renderCourseStudyBankView = () => {
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (!selectedCourse) return null;

    const courseSessions = (selectedCourse.sessions || [])
      .filter(s => s.aiOutput)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    const pendingCount = (selectedCourse.sessions || []).filter(
      s => !s.aiOutput && s.aiStatus === "pending"
    ).length;

    return (
      <div className="studybankPage">
        <header className="studybankNav">
          <button className="backBtn" onClick={() => setSelectedCourseId(null)}>← Study Bank</button>
          <h1>{selectedCourse.title}</h1>
        </header>

        <div className="statusBanners">
          {!isOnline && (
            <div className="offlineBanner">
              <span className="statusDot offline"></span>
              <p>Offline Mode. {pendingCount > 0 && `${pendingCount} tasks queued.`}</p>
            </div>
          )}
          {isOnline && pendingCount > 0 && (
            <div className="pendingBanner">
              <span className="statusDot processing"></span>
              <p>Processing {pendingCount} session(s)...</p>
            </div>
          )}
        </div>

        {courseSessions.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">📝</div>
            <h2>No Study Materials Yet</h2>
            <p>Add notes to create study materials for {selectedCourse.title}.</p>
          </div>
        ) : (
          <div className="sessionsList">
            {courseSessions.map((session) => {
              const currentTab = getSessionTab(session.id);
          
              return (
                <div key={session.id} className="sessionCard">
                  <div className="cardHeader">
                    <h2 className="sessionTitle">{session.title}</h2>
      
                  </div>

                  <div className="tabNavigation">
                    {["glossary", "summary", "memoryLink"].map((tab) => (
                      <button
                        key={tab}
                        className={`tabBtn ${currentTab === tab ? "active" : ""}`}
                        onClick={() => setSessionTab(session.id, tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('Link', ' Link')}
                      </button>
                    ))}
                  </div>

                  <div className="tabContent">
                    {currentTab === "glossary" && renderGlossary(session.aiOutput)}
                    {currentTab === "summary" && renderSummary(session.aiOutput)}
                    {currentTab === "memoryLink" && renderMemoryLink(session.aiOutput)}
                  </div>

                  <div className="cardActions">
                    <button className="actionBtn" onClick={() => window.print()}>
                    Print PDF
                    </button>
                    <button className="actionBtn" onClick={() => navigator.clipboard.writeText(JSON.stringify(session.aiOutput))}>
                    Copy JSON
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Main render logic
  if (selectedCourseId) {
    return renderCourseStudyBankView();
  } else {
    return renderCourseListView();
  }
}

export default StudyBankPage;