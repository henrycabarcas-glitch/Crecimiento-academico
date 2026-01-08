'use client';

import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { ReportCard } from '@/components/dashboard/report-card';
import { Student, SchoolSettings } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useStudents } from '@/hooks/use-students';
import { useSchoolSettings } from '@/hooks/use-school-settings';
import { useAchievements } from '@/hooks/use-achievements';
import { useCourses } from '@/hooks/use-courses';


// Mock data structure representing student grades with performance levels and associated achievements.
const gradesData: Record<string, Record<string, { term: string; grade: string | number; competency: string }>> = {
    "S001": { 
        "Dimensión Comunicativa": { term: "Trimestre 1", grade: "Superior", competency: "Identifica las vocales y su sonido de forma consistente." },
        "Dimensión Cognitiva": { term: "Trimestre 1", grade: "Alto", competency: "Cuenta objetos hasta el número 20 sin dificultad y reconoce los números." },
        "Dimensión Corporal": { term: "Trimestre 1", grade: "Alto", competency: "Muestra buena coordinación en actividades de motricidad gruesa." },
        "Dimensión Estética": { term: "Trimestre 1", grade: "Superior", competency: "Disfruta y participa activamente en actividades artísticas, mostrando gran creatividad." },
    },
    "S007": {
        "Matemáticas 1": { term: "Trimestre 1", grade: 4.5, competency: "Resuelve sumas y restas simples con precisión y comprende los conceptos básicos de la numeración." },
        "Lenguaje 1": { term: "Trimestre 1", grade: 5.0, competency: "Lee frases cortas con fluidez y excelente comprensión. Demuestra un vocabulario avanzado para su edad." },
        "Ciencias Naturales 1": { term: "Trimestre 1", grade: 4.8, competency: "Identifica y describe las partes de una planta y el ciclo de vida de los animales." },
        "Ciencias Sociales 1": { term: "Trimestre 1", grade: 4.2, competency: "Reconoce los símbolos patrios y describe su comunidad local." },
    },
};


function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Generando boletín...</p>
        </div>
    </div>
  );
}

export default function ReportCardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.studentId as string;
  const period = searchParams.get('period') || 'Trimestre 1';

  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: schoolSettings, isLoading: isLoadingSettings } = useSchoolSettings();

  const student = useMemo(() => students?.find(s => s.id === studentId), [students, studentId]);

  // For this mock, we assume all grades are for the same course for simplicity
  const { data: courses } = useCourses();
  const course = useMemo(() => courses?.find(c => c.gradeLevel === student?.gradeLevel), [courses, student]);
  const teacherName = course?.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "N/A";


  // In a real scenario, you'd fetch grades for the student for the selected period.
  // Here we use the mock data.
  const grades = useMemo(() => {
      const studentGrades = gradesData[studentId] || {};
      return Object.entries(studentGrades)
          .filter(([, gradeInfo]) => gradeInfo.term === period)
          .map(([subject, gradeInfo]) => ({
              subject,
              grade: gradeInfo.grade,
              competency: gradeInfo.competency,
          }));
  }, [studentId, period]);

  const isLoading = isLoadingStudents || isLoadingSettings;

  if (isLoading) {
    return <LoadingState />;
  }

  if (!student) {
    notFound();
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
        <div className="bg-white">
          <ReportCard 
            student={student}
            schoolSettings={schoolSettings}
            grades={grades}
            period={period}
            teacherName={teacherName}
          />
        </div>
    </Suspense>
  );
}
