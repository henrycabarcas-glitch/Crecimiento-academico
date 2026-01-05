export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    documentType: string;
    documentNumber: string;
    expeditionCountry?: string;
    expeditionDepartment?: string;
    expeditionMunicipality?: string;
    dateOfBirth: string;
    birthCountry?: string;
    birthDepartment?: string;
    birthMunicipality?: string;
    gender: string;
    gradeLevel: string;
    enrollmentDate: string;
    previousInstitution?: string;
    academicSituation?: string;
    parentIds: string[];
    parents?: Parent[];
    address?: string;
    residentialZone?: string;
    phoneNumber?: string;
    socioeconomicStratum?: string;
    sisbenScore?: string;
    healthProvider?: string;
    healthCenter?: string;
    bloodType?: string;
    disability?: string;
}
  
export interface Parent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentIds?: string[];
}

export type UserRole = 'Profesor' | 'Acudiente' | 'Director' | 'Directivo Docente' | 'Administrador';

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: UserRole;
    courseIds?: string[];
}
export interface User extends Teacher, Partial<Parent> {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    sourceCollection: 'teachers' | 'parents';
}
  
export interface Course {
    id: string;
    name: string;
    description?: string;
    teacherId: string;
    gradeLevel: string;
    studentIds: string[];
    teacher?: {
        firstName: string;
        lastName: string;
    }
}
  
export type PerformanceGrade = "Superior" | "Alto" | "Básico" | "Bajo";

export interface Grade {
    studentId: string;
    courseId: string;
    achievementId: string;
    term: string;
    grade: PerformanceGrade;
    competency?: string; // Denormalized from Achievement for easy access
}
  
export interface BehaviorLog {
    id: number;
    studentId: string;
    date: string;
    observation: string;
    observer: string;
}

export interface Achievement {
    id: string;
    courseId: string;
    period: string;
    description: string;
    gradeLevel: string;
}

export interface Payment {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  method: string;
  receiptNumber: string;
  concept: string;
}

export interface SchoolSettings {
    schoolName: string;
    nit?: string;
    resolutionMEN?: string;
    rectorName?: string;
    phone?: string;
    address?: string;
    email?: string;
    logoUrl?: string;
}
