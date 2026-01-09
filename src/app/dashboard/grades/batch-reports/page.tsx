'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportCard } from '@/components/dashboard/report-card';
import { Student, SchoolSettings } from '@/lib/types';
import { Loader2, Printer } from 'lucide-react';
import { BatchPrintButton } from '@/components/dashboard/batch-print-button';
import { useStudents } from '@/hooks/use-students';
import { useSchoolSettings } from '@/hooks/use-school-settings';
import { useCourses } from '@/hooks/use-courses';


// Mock data structure representing student grades with performance levels and associated achievements.
const gradesData: Record<string, Record<string, { term: string; grades: (string | number)[]; final: string | number; competency: string }>> = {
    "S001": { 
        "Dimensión Comunicativa": { term: "Trimestre 1", grades: ["Superior", "Alto", "Superior", "Alto"], final: "Superior", competency: "Identifica las vocales y su sonido de forma consistente." },
        "Dimensión Cognitiva": { term: "Trimestre 1", grades: ["Alto", "Alto", "Básico", "Superior"], final: "Alto", competency: "Cuenta objetos hasta el número 20 sin dificultad y reconoce los números." },
        "Dimensión Corporal": { term: "Trimestre 1", grades: ["Alto", "Alto", "Básico", "Superior"], final: "Alto", competency: "Muestra buena coordinación en actividades de motricidad gruesa." },
        "Dimensión Estética": { term: "Trimestre 1", grades: ["Superior", "Superior", "Superior", "Superior"], final: "Superior", competency: "Disfruta y participa activamente en actividades artísticas, mostrando gran creatividad." },
    },
    "S002": { 
        "Dimensión Comunicativa": { term: "Trimestre 1", grades: ["Alto", "Básico", "Básico", "Alto"], final: "Alto", competency: "Reconoce su nombre escrito." },
        "Dimensión Corporal": { term: "Trimestre 1", grades: ["Básico", "Básico", "Bajo", "Básico"], final: "Básico", competency: "Muestra dificultad para atarse los cordones." }
    },
    "S003": { 
        "Dimensión Comunicativa": { term: "Trimestre 1", grades: ["Superior", "Superior", "Superior", "Alto"], final: "Superior", competency: "Escribe su nombre sin ayuda." },
        "Dimensión Cognitiva": { term: "Trimestre 1", grades: ["Superior", "Alto", "Superior", "Superior"], final: "Superior", competency: "Clasifica objetos por color y forma." }
    },
    "S007": {
        "Matemáticas 1": { term: "Trimestre 1", grades: [4.5, 4.2, 5.0, 4.8], final: 4.6, competency: "Resuelve sumas y restas simples con precisión y comprende los conceptos básicos de la numeración." },
        "Lenguaje 1": { term: "Trimestre 1", grades: [5.0, 4.8, 5.0, 5.0], final: 5.0, competency: "Lee frases cortas con fluidez y excelente comprensión. Demuestra un vocabulario avanzado para su edad." },
        "Ciencias Naturales 1": { term: "Trimestre 1", grades: [4.8, 4.5, 5.0, 4.9], final: 4.8, competency: "Identifica y describe las partes de una planta y el ciclo de vida de los animales." },
        "Ciencias Sociales 1": { term: "Trimestre 1", grades: [4.2, 4.0, 4.5, 4.3], final: 4.3, competency: "Reconoce los símbolos patrios y describe su comunidad local." },
    },
    "S008": { 
        "Matemáticas 1": { term: "Trimestre 1", grades: [3.2, 3.0, 2.8, 3.5], final: 3.1, competency: "Requiere apoyo en la resolución de restas." },
        "Lenguaje 1": { term: "Trimestre 1", grades: [3.8, 4.0, 3.5, 4.1], final: 3.9, competency: "Identifica personajes principales en un cuento." }
    },
};


type ReportData = {
    student: Student;
    grades: { subject: string; grade: string | number; competency?: string; }[];
    teacherName?: string | null;
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Generando boletines...</p>
        </div>
    </div>
  );
}

export default function BatchReportCardPage() {
  const searchParams = useSearchParams();
  const studentIds = useMemo(() => searchParams.get('studentIds')?.split(',') || [], [searchParams]);
  const period = searchParams.get('period') || 'Trimestre 1';

  const { data: allStudents, isLoading: isLoadingStudents } = useStudents();
  const { data: schoolSettings, isLoading: isLoadingSettings } = useSchoolSettings();
  const { data: courses } = useCourses();
  
  const reports = useMemo(() => {
    if (!allStudents || !courses) return [];

    const selectedStudents = allStudents.filter(s => studentIds.includes(s.id));
    
    const reportData: ReportData[] = [];

    for (const student of selectedStudents) {
      const studentGrades = gradesData[student.id] || {};
      const gradesForPeriod = Object.entries(studentGrades)
        .filter(([, gradeInfo]) => gradeInfo.term === period)
        .map(([subject, gradeInfo]) => ({
          subject,
          grade: gradeInfo.final, // We use the final grade for the report card
          competency: gradeInfo.competency,
        }));
      
      const course = courses.find(c => c.gradeLevel === student.gradeLevel);
      const teacherName = course?.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "N/A";
            
      reportData.push({
        student,
        grades: gradesForPeriod,
        teacherName,
      });
    }

    return reportData.sort((a,b) => a.student.lastName.localeCompare(b.student.lastName));
  }, [allStudents, studentIds, period, courses]);

  const isLoading = isLoadingStudents || isLoadingSettings;

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!schoolSettings) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Cargando información del colegio...</p>
                <p className="text-sm text-muted-foreground/80">Asegúrese de que los datos del colegio estén configurados.</p>
            </div>
        </div>
      )
  }

  return (
     <Suspense fallback={<LoadingState />}>
        <div className="bg-gray-50">
            <BatchPrintButton />
            <div id="print-area">
                {reports.map((report) => (
                     <ReportCard 
                        key={report.student.id}
                        student={report.student}
                        schoolSettings={schoolSettings}
                        grades={report.grades}
                        period={period}
                        teacherName={report.teacherName || undefined}
                        isBatch={true}
                    />
                ))}
            </div>
             {reports.length === 0 && (
                <div className="flex h-screen items-center justify-center">
                    <p className="text-muted-foreground">No se encontraron estudiantes para generar boletines.</p>
                </div>
            )}
        </div>
    </Suspense>
  );
}
