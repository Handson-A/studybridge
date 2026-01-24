const STORAGE_KEY = "studybridge_data";

function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const initialData = {
      courses: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
}

function getData() {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* Course operations */

export function getCourses() {
  return getData().courses;
}

export function addCourse(title) {
  const data = getData();

  const newCourse = {
    id: crypto.randomUUID(),
    title,
    createdAt: Date.now(),
    sessions: []
  };

  data.courses.push(newCourse);
  saveData(data);

  return newCourse;
}

export function deleteCourse(courseId) {
  const data = getData();
  data.courses = data.courses.filter(c => c.id !== courseId);
  saveData(data);
}

/* Session operations */

export function addSession(courseId, sessionTitle, rawNotes = "") {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);

  if (!course) return null;

  const newSession = {
    id: crypto.randomUUID(),
    title: sessionTitle,
    rawNotes,
    aiOutput: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  course.sessions.push(newSession);
  saveData(data);

  return newSession;
}

export function updateSession(courseId, sessionId, updates) {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (!course) return;

  const session = course.sessions.find(s => s.id === sessionId);
  if (!session) return;

  Object.assign(session, updates, { updatedAt: Date.now() });
  saveData(data);
}

export function deleteSession(courseId, sessionId) {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (!course) return;

  course.sessions = course.sessions.filter(s => s.id !== sessionId);
  saveData(data);
}