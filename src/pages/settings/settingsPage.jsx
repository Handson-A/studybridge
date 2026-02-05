import { useState } from "react";
import {
  getCourses,
  addCourse,
  deleteCourse,
  updateCourse
} from "../../services/storageService";
import "./settingsPage.css";

function SettingsPage({ onBack, onCourseAdded }) {
  const [courses, setCourses] = useState(() => getCourses());
  const [activeTab, setActiveTab] = useState("courses");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  // Initial state for the course details form
  const initialCourseData = {
    venue: "",
    schedules: [{ day: "Monday", time: "" }],
    instructor: ""
  };
  const [courseData, setCourseData] = useState(initialCourseData);

  const handleAddCourse = () => {
    const trimmedTitle = newCourseTitle.trim();
    if (!trimmedTitle) return;

    const course = addCourse(trimmedTitle, newCourseCode.trim());
    setCourses(prev => [...prev, course]);
    setNewCourseTitle("");
    setNewCourseCode("");
    onCourseAdded?.();
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure? This will delete all notes for this course.")) {
      deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setExpandedCourse(null);
    }
  };

  const handleCourseExpand = (courseId) => {
    // If clicking the same course, close it. Otherwise, open new one and load existing data.
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      const course = courses.find(c => c.id === courseId);
      setCourseData({
        venue: course.venue || "",
        schedules: course.schedules && course.schedules.length > 0 
          ? course.schedules 
          : [{ day: "Monday", time: "" }],
        instructor: course.instructor || ""
      });
    }
  };

  const handleSaveCourseDetails = (courseId) => {
    const updatedCourse = updateCourse(courseId, courseData);
    if (updatedCourse) {
      setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
      setExpandedCourse(null);
    }
  };

  const addSchedule = () => {
    setCourseData({
      ...courseData,
      schedules: [...courseData.schedules, { day: "Monday", time: "" }]
    });
  };

  const removeSchedule = (index) => {
    if (courseData.schedules.length > 1) {
      setCourseData({
        ...courseData,
        schedules: courseData.schedules.filter((_, i) => i !== index)
      });
    }
  };

  const updateSchedule = (index, field, value) => {
    const newSchedules = [...courseData.schedules];
    newSchedules[index][field] = value;
    setCourseData({ ...courseData, schedules: newSchedules });
  };

  return (
    <div className="settingsPage">
      <header className="settingsHeader">
        <button className="backBtn" onClick={onBack} aria-label="Go back">
         Back
        </button>
        <h1>Settings</h1>
      </header>

      <nav className="tabsContainer">
        <button
          className={`tab ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
      </nav>

      {activeTab === "courses" && (
        <div className="tabContent">
          <section className="addCourseSection">
            <h2>Add a New Course</h2>
            <div className="addCourseForm">
              <input
                type="text"
                placeholder="e.g., Digital Forensics 101"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCourse()}
              />
              <input
                type="text"
                placeholder="e.g., CS 401"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCourse()}
              />
              <button onClick={handleAddCourse} className="btnPrimary">
                Add Course
              </button>
            </div>
          </section>

          <section className="coursesListSection">
            <h2>Your Courses</h2>
            {courses.length === 0 ? (
              <p className="emptyText">No courses yet. Add your first course above!</p>
            ) : (
              <div className="coursesList">
                {courses.map((course) => (
                  <div key={course.id} className={`courseCard ${expandedCourse === course.id ? 'expanded' : ''}`}>
                    <div
                      className="courseCardHeader"
                      onClick={() => handleCourseExpand(course.id)}
                    >
                      <div className="courseHeaderInfo">
                        {course.code && <span className="courseCode">{course.code}</span>}
                        <h3>{course.title}</h3>
                      </div>
                      <span className="expandIcon">
                        {expandedCourse === course.id ? "▼" : "▶"}
                      </span>
                    </div>

                    {expandedCourse === course.id && (
                      <div className="courseCardContent">
                        <div className="formGrid">
                          <div className="formGroup">
                            <label>Venue</label>
                            <input
                              type="text"
                              placeholder="e.g., Room 201A"
                              value={courseData.venue}
                              onChange={(e) => setCourseData({...courseData, venue: e.target.value})}
                            />
                          </div>

                          <div className="formGroup">
                            <label>Instructor</label>
                            <input
                              type="text"
                              placeholder="Prof. Name"
                              value={courseData.instructor}
                              onChange={(e) => setCourseData({...courseData, instructor: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="schedulesSection">
                          <div className="schedulesSectionHeader">
                            <label>Class Schedule(s)</label>
                            <button 
                              type="button" 
                              className="btnSecondary btnSmall" 
                              onClick={addSchedule}
                            >
                              + Add Time
                            </button>
                          </div>
                          
                          {courseData.schedules.map((schedule, index) => (
                            <div key={index} className="scheduleRow">
                              <select
                                value={schedule.day}
                                onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                                className="scheduleDay"
                              >
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                              
                              <input
                                type="time"
                                value={schedule.time}
                                onChange={(e) => updateSchedule(index, 'time', e.target.value)}
                                className="scheduleTime"
                              />
                              
                              {courseData.schedules.length > 1 && (
                                <button
                                  type="button"
                                  className="btnRemove"
                                  onClick={() => removeSchedule(index)}
                                  aria-label="Remove schedule"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="courseCardActions">
                          <button className="btnPrimary" onClick={() => handleSaveCourseDetails(course.id)}>
                            Save Details
                          </button>
                          <button className="btnDanger" onClick={() => handleDeleteCourse(course.id)}>
                            Delete Course
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "about" && (
        <section className="aboutSection">
          <h2>About StudyBridge</h2>
          <div className="aboutContent">
            <div className="aboutItem">
              <h3>Version 1.0.0</h3>
              <p>StudyBridge is an AI-powered companion designed for IT students to turn lecture notes into structured study assets.</p>
            </div>
            <div className="aboutItem">
              <h3>Privacy</h3>
              <p>Everything stays on your device. We use local storage to ensure your notes are private and accessible offline.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SettingsPage;