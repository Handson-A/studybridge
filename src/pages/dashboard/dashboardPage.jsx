import { useState, useMemo, useEffect } from "react";
import { getCourses, getUserName } from "../../services/storageService";
import "./dashboardPage.css";

function DashboardPage({ onNavigateToSessions, onNavigateToStudyBank, onNavigateToSettings }) {
  const [courses] = useState(() => getCourses());
  const [userName] = useState(() => getUserName() || "User");
  
  // Stable reference for time to satisfy React's purity rules
  const [renderTime, setRenderTime] = useState(() => Date.now());

  useEffect(() => {
    setRenderTime(Date.now());
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date(renderTime).getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [renderTime]);

  // Calculate total sessions across all courses
  const totalSessions = useMemo(() => {
    return courses.reduce((sum, c) => sum + (c.sessions?.length || 0), 0);
  }, [courses]);

  // Calculate global last activity info (course added, session added, or session updated)
  const lastActivityInfo = useMemo(() => {
    let mostRecent = 0;
    
    courses.forEach(course => {
      // Check when course was added
      if (course.createdAt > mostRecent) mostRecent = course.createdAt;
      
      // Check all sessions for this course
      course.sessions?.forEach(session => {
        // Check when session was added
        if (session.createdAt > mostRecent) mostRecent = session.createdAt;
        // Check when session was last updated
        if (session.updatedAt > mostRecent) mostRecent = session.updatedAt;
      });
    });

    if (mostRecent === 0) return { text: "No activity yet", value: "0" };

    const diff = renderTime - mostRecent;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `${days} day${days > 1 ? 's' : ''} ago`, value: days };
    if (hours > 0) return { text: `${hours} hour${hours > 1 ? 's' : ''} ago`, value: hours };
    return { text: "Just now", value: "0" };
  }, [courses, renderTime]);

  const countStudyCards = (course) => {
    return course.sessions?.reduce((count, session) => {
      return count + (session.aiOutput?.glossary?.length || 0);
    }, 0) || 0;
  };

  const getNextClassInfo = (course) => {
    const schedules = Array.isArray(course.schedules) ? course.schedules : [];
    const venue = course.venue || "";

    if (schedules.length === 0) {
      return {
        timeText: "Next class not set",
        venueText: venue ? `Venue: ${venue}` : "Venue not set"
      };
    }

    const dayToIndex = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, 
      Thursday: 4, Friday: 5, Saturday: 6
    };

    const now = new Date(renderTime);
    const nowDay = now.getDay();
    let closest = null;

    schedules.forEach((schedule) => {
      const dayIndex = dayToIndex[schedule.day];
      if (dayIndex === undefined) return;

      const [hours, minutes] = (schedule.time || "").split(":").map(Number);
      const hasTime = Number.isFinite(hours) && Number.isFinite(minutes);

      const candidate = new Date(now);
      let dayOffset = (dayIndex - nowDay + 7) % 7;

      if (dayOffset === 0 && hasTime) {
        const candidateTime = new Date(now);
        candidateTime.setHours(hours, minutes, 0, 0);
        if (candidateTime <= now) {
          dayOffset = 7;
        }
      }

      candidate.setDate(now.getDate() + dayOffset);
      if (hasTime) {
        candidate.setHours(hours, minutes, 0, 0);
      } else {
        candidate.setHours(0, 0, 0, 0);
      }

      if (!closest || candidate < closest.date) {
        closest = { schedule, date: candidate, hasTime };
      }
    });

    if (!closest) {
      return {
        timeText: "Next class not set",
        venueText: venue ? `Venue: ${venue}` : "Venue not set"
      };
    }

    const weekday = closest.date.toLocaleDateString("en-US", { weekday: "short" });
    const timeText = closest.hasTime
      ? closest.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "Time not set";

    return {
      timeText: `Next class: ${weekday} · ${timeText}`,
      venueText: venue ? `Venue: ${venue}` : "Venue not set"
    };
  };

  return (
    <div className="dashboardPage">
      <header className="dashHeader">
        <div className="headerContent">
          <div>
            <h1>{greeting}, {userName}</h1>
            <p className="dashSubtitle">Ready to continue your learning journey?</p>
          </div>
        </div>
        <button className="settingsBtn" onClick={onNavigateToSettings} aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
          </svg>
        </button>
      </header>

      <div className="statsGrid">
        <div className="statCard">
          <div className="statIcon bookIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{totalSessions}</div>
            <div className="statLabel">Study Sessions</div>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon clockIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{lastActivityInfo.value}</div>
            <div className="statLabel">Last Activity</div>
          </div>
        </div>
      </div>

      <section className="coursesSection">
        <div className="sectionHeader">
          <div>
            <h2>Your Courses</h2>
            <p className="sectionSubtitle">
              Managing {courses.length} course{courses.length !== 1 ? 's' : ''} this semester
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="emptyState">
            <p className="emptyText">No courses yet. Add your first course to get started!</p>
            <button className="btnPrimary" onClick={onNavigateToSettings}>Add Course</button>
          </div>
        ) : (
          <div className="coursesGrid">
            {courses.map((course) => {
              const nextClass = getNextClassInfo(course);
              return (
                <div key={course.id} className="courseCard">
                  <div className="courseHeader">
                    <div className="courseCode">
                      {course.code || course.title.split(' ')[0] || 'COURSE'}
                    </div>
                    <button 
                      className="iconBtn"
                      onClick={() => onNavigateToSessions(course.id)}
                      aria-label="Open course"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </button>
                  </div>

                  <h3 className="courseTitle">{course.title}</h3>

                  <div className="courseStats">
                    <div className="courseStat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <span>Sessions: <strong>{course.sessions?.length || 0}</strong></span>
                    </div>
                    <div className="courseStat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                        <polyline points="17 2 12 7 7 2"></polyline>
                      </svg>
                      <span>Cards: <strong>{countStudyCards(course)}</strong></span>
                    </div>
                  </div>

                  <div className="courseActivity">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{nextClass.timeText}</span>
                  </div>

                  <div className="courseActivity">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{nextClass.venueText}</span>
                  </div>

                  <div className="courseActions">
                    <button 
                      className="btnPrimary addNoteBtn"
                      onClick={() => onNavigateToSessions(course.id)}
                    >
                      + Add Notes
                    </button>
                    <button 
                      className="btnSecondary"
                      onClick={() => onNavigateToStudyBank(course.id)}
                    >
                      Study Bank
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="quickActions">
        <h2>Quick Actions</h2>
        <div className="actionsList">
          <button 
            className="actionItem"
            onClick={() => courses.length > 0 ? onNavigateToSessions(courses[0].id) : onNavigateToSettings()}
          >
            <div className="actionIcon addIcon">+</div>
            <div className="actionContent">
              <div className="actionTitle">Add New Note</div>
              <div className="actionSubtitle">Captures lecture content</div>
            </div>
            <div className="actionArrow">→</div>
          </button>

          <button className="actionItem" onClick={onNavigateToStudyBank}>
            <div className="actionIcon bankIcon">🏦</div>
            <div className="actionContent">
              <div className="actionTitle">Study Bank</div>
              <div className="actionSubtitle">Browse all materials</div>
            </div>
            <div className="actionArrow">→</div>
          </button>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;