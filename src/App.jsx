import { useState, useEffect } from "react";
import DashboardPage from "./pages/dashboard/dashboardPage";
import OnboardingPage from "./pages/onboarding/onboardingPage";
import CoursesPage from "./pages/courses/coursePage";
import SessionPage from "./pages/sessions/sessionPage";
import SettingsPage from "./pages/settings/settingsPage";
import StudyBankPage from "./pages/studybank/studybankPage";
import { getCourses, getUserName, setUserName, updateSession } from "./services/storageService";
import { processNotes } from "./services/aiService";

function App() {
  // Check if this is first time (no courses)
  const hasNoCourses = getCourses().length === 0;
  const hasNoUserName = !getUserName().trim();
  
  // Navigation state - start with onboarding if no courses
  const [currentPage, setCurrentPage] = useState(
    hasNoCourses || hasNoUserName ? "onboarding" : "dashboard"
  );
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    const processPendingSessions = () => {
      if (!navigator.onLine) return;

      const courses = getCourses();
      courses.forEach(course => {
        course.sessions?.forEach(session => {
          const needsProcessing = !session.aiOutput && session.rawNotes && (session.aiStatus === "pending" || session.aiStatus == null);
          if (needsProcessing) {
            updateSession(course.id, session.id, { aiStatus: "processing" });
            processNotes(session.rawNotes)
              .then(result => {
                if (result) {
                  updateSession(course.id, session.id, {
                    aiOutput: result,
                    aiStatus: "done"
                  });
                }
              })
              .catch(() => {
                updateSession(course.id, session.id, { aiStatus: "pending" });
              });
          }
        });
      });
    };

    const handleOnline = () => processPendingSessions();

    processPendingSessions();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Handle page navigation
  const goToDashboard= () => {
    setCurrentPage("dashboard");
    setActiveCourseId(null);
  };


  const goToSessions = (courseId) => {
    setCurrentPage("sessions");
    setActiveCourseId(courseId);
  };

  const goToStudyBank = () => {
    setCurrentPage("studybank");
  };

  const goToSettings = () => {
    setCurrentPage("settings");
  };

  // Handle course added in settings
  const handleCourseAdded = () => {
    // After adding a course, go to dashboard
    goToDashboard();
  };

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case "onboarding":
        return (
          <OnboardingPage
            onGetStarted={(name) => {
              setUserName(name.trim());
              goToSettings();
            }}
          />
        );
      case "dashboard":
        return (
          <DashboardPage
            onNavigateToSessions={goToSessions}
            onNavigateToStudyBank={goToStudyBank}
            onNavigateToSettings={goToSettings}
          />
        );
     
      case "sessions":
        return (
          <SessionPage
            courseId={activeCourseId}
            onBack={goToDashboard}
            onNavigateToStudyBank={goToStudyBank}
          />
        );
      case "settings":
        return (
          <SettingsPage
            onBack={goToDashboard}
            onCourseAdded={handleCourseAdded}
          />
        );
      case "studybank":
        return (
          <StudyBankPage
            onBack={goToDashboard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <main className="appMain">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
