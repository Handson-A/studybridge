import { useEffect, useState } from "react";
import {
  getCourses,
  addCourse,
  deleteCourse
} from "../../services/storageService";
import SessionPage from "../sessions/sessionPage";
import "./coursePage.css";

function CoursesPage() {
  const [courses, setCourses] = useState(() => getCourses());
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
  }, []);

  function handleAddCourse() {
    if (!newTitle.trim()) return;

    const course = addCourse(newTitle.trim());
    setCourses(prev => [...prev, course]);
    setNewTitle("");
  }

  function handleDeleteCourse(id) {
    deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }

 if (activeCourseId) {
  return (
    <SessionPage
      courseId={activeCourseId}
      onBack={() => setActiveCourseId(null)}
    />
  );
}

return (
  <section className="coursesPage">
    <h2>Your Courses</h2>

    <div className="courseInput">
      <input
        type="text"
        placeholder="New course name"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
      />
      <button onClick={handleAddCourse}>Add</button>
    </div>

    {courses.length === 0 ? (
      <p className="emptyText">No courses yet.</p>
    ) : (
      <ul className="courseList">
        {courses.map(course => (
          <li
            key={course.id}
            className="courseItem"
            onClick={() => setActiveCourseId(course.id)}
          >
            <span>{course.title}</span>
            <button
              className="deleteBtn"
              onClick={e => {
                e.stopPropagation();
                handleDeleteCourse(course.id);
              }}
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

export default CoursesPage;
