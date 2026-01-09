
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
    photoUrl?: string;
    studentIds?: string[];
}

export type UserRole = 'Profesor' | 'Acudiente' | 'Director' | 'Directivo Docente' | 'Administrador';

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
    role?: UserRole;
    courseIds?: string[];
}
export interface User extends Teacher, Partial<Parent> {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
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

export interface ReportCard {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "ReportCard",
      "type": "object",
      "description": "Represents a student's report card for a specific period.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the ReportCard entity."
        },
        "studentId": {
          "type": "string",
          "description": "Reference to Student. (Relationship: Student 1:N ReportCard)"
        },
        "courseId": {
          "type": "string",
          "description": "Reference to Course. (Relationship: Course 1:N ReportCard)"
        },
        "period": {
          "type": "string",
          "description": "The academic period the report card is for (e.g., 'First Semester', 'Second Quarter')."
        },
        "grade": {
          "type": "number",
          "description": "The final grade for the course in this period."
        },
        "comments": {
          "type": "string",
          "description": "Teacher's comments on the student's performance."
        },
        "dateIssued": {
          "type": "string",
          "description": "Date when the report card was issued.",
          "format": "date"
        }
      },
      "required": [
        "id",
        "studentId",
        "courseId",
        "period",
        "grade"
      ]
    }
  
export interface BehavioralObservation {
    id: string;
    studentId: string;
    date: string;
    description: string;
    teacherId: string;
    type: 'Positive' | 'Negative' | 'Needs Improvement';
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
    daneCode?: string;
    rectorName?: string;
    phone?: string;
    address?: string;
    email?: string;
    logoUrl?: string;
}

    