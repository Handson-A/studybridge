import { useState } from "react";
import {
  getCourses,
  addCourse,
  deleteCourse
} from "../../services/storageService";
import "./coursePage.css";

function CoursesPage({ onCourseClick, onBack }) {
  
  const [courses, setCourses] = useState(() => getCourses());
  const [newTitle, setNewTitle] = useState("");

  const handleAddCourse = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const course = addCourse(trimmedTitle);
    setCourses(prev => [...prev, course]);
    setNewTitle("");
  };

  const handleDeleteCourse = (id) => {
    
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    
    deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <section className="coursesPage">
      <header className="coursesHeader">
        {onBack && (
          <button className="backBtn" onClick={onBack} aria-label="Go back">
            ← Dashboard
          </button>
        )}
        <h2>Your Courses</h2>
      </header>

      <div className="courseInput">
        <input
          type="text"
          placeholder="New course name..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          
          onKeyDown={e => e.key === 'Enter' && handleAddCourse()}
        />
        <button onClick={handleAddCourse} disabled={!newTitle.trim()}>
          Add
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="emptyText">No courses yet. Add one above!</p>
      ) : (
        <ul className="courseList">
          {courses.map(course => (
            <li
              key={course.id}
              className="courseItem"
              onClick={() => onCourseClick?.(course.id)}
            >
              <span className="courseTitle">{course.title}</span>
              <button
                className="deleteBtn"
                title="Delete Course"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteCourse(course.id);
                }}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CoursesPage;