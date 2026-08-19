import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { createStudent, EDUCATION_EVENTS, type Classroom, type EducationRole, type ExplanationLevel, type LessonEvent, type Student } from "@/lib/education";

const EDUCATION_STORAGE_KEY = "radar-tempo-educacao-v1";
type EducationSnapshot = { institutionName: string; teacherName: string; students: Student[]; classrooms: Classroom[]; activeClassroomId: string; role: EducationRole; alertsEnabled: boolean };
type EducationContextValue = EducationSnapshot & { activeClassroom: Classroom; selectedEvent: LessonEvent; setRole: (role: EducationRole) => void; selectEvent: (eventId: string) => void; createClassroom: (name: string, educationLevel: string, city: string) => void; addStudent: (name: string, email: string) => void; assignStudent: (studentId: string) => void; sendEventToClass: () => void; togglePresentation: () => void; setAlertsEnabled: (value: boolean) => void; updateInstitution: (value: string) => void; updateTeacherName: (value: string) => void; hydrated: boolean };

const EducationContext = createContext<EducationContextValue | null>(null);
const initialStudents: Student[] = [{ id: "student-ana", name: "Ana Souza", email: "ana@colegio.edu.br", level: "Ensino Fundamental II" }, { id: "student-caio", name: "Caio Lima", email: "caio@colegio.edu.br", level: "Ensino Fundamental II" }, { id: "student-joana", name: "Joana Reis", email: "joana@colegio.edu.br", level: "Ensino Fundamental II" }];
const initialClassrooms: Classroom[] = [{ id: "class-8a", name: "8º Ano A · Ciências", educationLevel: "Ensino Fundamental II", studentIds: initialStudents.map((student) => student.id), city: "São Paulo", isPresenting: true, activeEventId: "sao-paulo" }];

export function EducationProvider({ children }: PropsWithChildren) {
  const [institutionName, setInstitutionName] = useState("Colégio Horizonte");
  const [teacherName, setTeacherName] = useState("Prof. Marina Costa");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [activeClassroomId, setActiveClassroomId] = useState("class-8a");
  const [role, setRole] = useState<EducationRole>("teacher");
  const [selectedEventId, setSelectedEventId] = useState("sao-paulo");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const raw = await AsyncStorage.getItem(EDUCATION_STORAGE_KEY);
        if (!raw || !active) return;
        const saved = JSON.parse(raw) as Partial<EducationSnapshot>;
        if (saved.institutionName) setInstitutionName(saved.institutionName);
        if (saved.teacherName) setTeacherName(saved.teacherName);
        if (Array.isArray(saved.students) && saved.students.length) setStudents(saved.students);
        if (Array.isArray(saved.classrooms) && saved.classrooms.length) setClassrooms(saved.classrooms);
        if (saved.activeClassroomId) setActiveClassroomId(saved.activeClassroomId);
        if (saved.role === "teacher" || saved.role === "student") setRole(saved.role);
        if (typeof saved.alertsEnabled === "boolean") setAlertsEnabled(saved.alertsEnabled);
      } catch {
        // A plataforma permanece utilizável com os dados demonstrativos.
      } finally { if (active) setHydrated(true); }
    }
    void restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify({ institutionName, teacherName, students, classrooms, activeClassroomId, role, alertsEnabled }));
  }, [activeClassroomId, alertsEnabled, classrooms, hydrated, institutionName, role, students, teacherName]);

  const activeClassroom = classrooms.find((classroom) => classroom.id === activeClassroomId) ?? classrooms[0];
  const selectedEvent = EDUCATION_EVENTS.find((event) => event.id === selectedEventId) ?? EDUCATION_EVENTS[0];
  const selectEvent = useCallback((eventId: string) => setSelectedEventId(eventId), []);
  const createClassroom = useCallback((name: string, educationLevel: string, city: string) => {
    if (!name.trim()) return;
    const classroom: Classroom = { id: `class-${Date.now()}`, name: name.trim(), educationLevel, city, studentIds: [], isPresenting: false };
    setClassrooms((current) => [classroom, ...current]);
    setActiveClassroomId(classroom.id);
  }, []);
  const addStudent = useCallback((name: string, email: string) => {
    if (!name.trim() || !email.trim()) return;
    const student = createStudent(name, email, activeClassroom.educationLevel);
    setStudents((current) => [student, ...current]);
    setClassrooms((current) => current.map((classroom) => classroom.id === activeClassroom.id ? { ...classroom, studentIds: [...classroom.studentIds, student.id] } : classroom));
  }, [activeClassroom]);
  const assignStudent = useCallback((studentId: string) => setClassrooms((current) => current.map((classroom) => classroom.id === activeClassroom.id && !classroom.studentIds.includes(studentId) ? { ...classroom, studentIds: [...classroom.studentIds, studentId] } : classroom)), [activeClassroom.id]);
  const sendEventToClass = useCallback(() => setClassrooms((current) => current.map((classroom) => classroom.id === activeClassroom.id ? { ...classroom, activeEventId: selectedEvent.id } : classroom)), [activeClassroom.id, selectedEvent.id]);
  const togglePresentation = useCallback(() => setClassrooms((current) => current.map((classroom) => classroom.id === activeClassroom.id ? { ...classroom, isPresenting: !classroom.isPresenting } : classroom)), [activeClassroom.id]);
  const value = useMemo<EducationContextValue>(() => ({ institutionName, teacherName, students, classrooms, activeClassroomId, role, alertsEnabled, activeClassroom, selectedEvent, hydrated, setRole, selectEvent, createClassroom, addStudent, assignStudent, sendEventToClass, togglePresentation, setAlertsEnabled, updateInstitution: setInstitutionName, updateTeacherName: setTeacherName }), [institutionName, teacherName, students, classrooms, activeClassroomId, role, alertsEnabled, activeClassroom, selectedEvent, hydrated, selectEvent, createClassroom, addStudent, assignStudent, sendEventToClass, togglePresentation]);
  return <EducationContext.Provider value={value}>{children}</EducationContext.Provider>;
}

export function useEducation() { const context = useContext(EducationContext); if (!context) throw new Error("useEducation deve ser utilizado dentro de EducationProvider"); return context; }
export type { ExplanationLevel };
