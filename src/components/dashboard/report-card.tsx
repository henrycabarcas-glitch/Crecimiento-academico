'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Student, SchoolSettings } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type GradeEntry = {
    subject: string;
    grade: string | number;
    competency?: string;
};

interface ReportCardProps {
  student: Student;
  schoolSettings: SchoolSettings;
  grades: GradeEntry[];
  period: string;
  teacherName?: string;
  isBatch?: boolean; // Flag to control printing behavior
}

const getGradeColorClass = (grade?: string | number) => {
    if (typeof grade === 'string') {
        switch(grade) {
            case 'Superior': return 'text-emerald-700 font-semibold';
            case 'Alto': return 'text-blue-700 font-semibold';
            case 'Básico': return 'text-yellow-700';
            case 'Bajo': return 'text-red-700 font-bold';
            default: return 'text-gray-500';
        }
    }
    if (typeof grade === 'number') {
        if (grade >= 4.6) return 'text-emerald-700 font-semibold';
        if (grade >= 4.0) return 'text-blue-700 font-semibold';
        if (grade >= 3.0) return 'text-yellow-700';
        if (grade >= 1.0) return 'text-red-700 font-bold';
    }
    return 'text-gray-500';
}

const isPreschoolGrade = (grade: string) => ['Pre-jardín', 'Jardín', 'Transición'].includes(grade);

export function ReportCard({
  student,
  schoolSettings,
  grades,
  period,
  teacherName = "N/A",
  isBatch = false
}: ReportCardProps) {

  useEffect(() => {
    if (isBatch) return; // Don't auto-print in batch mode

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, [isBatch]);

  const isPreschool = isPreschoolGrade(student.gradeLevel);

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-gray-200 shadow-md font-sans @media print:shadow-none @media print:border-none @media print:my-0 @media print:break-after-page">
      <header className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-6">
          {schoolSettings.logoUrl && (
            <div className="relative w-24 h-24">
              <Image
                src={schoolSettings.logoUrl}
                alt="Logo del Colegio"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          <div className='pt-2'>
            <h1 className="text-3xl font-bold text-gray-800">{schoolSettings.schoolName}</h1>
            <p className="text-sm text-gray-500 mt-1">NIT: {schoolSettings.nit} | DANE: {schoolSettings.daneCode}</p>
            <p className="text-sm text-gray-500">Resolución MEN: {schoolSettings.resolutionMEN}</p>
          </div>
        </div>
        <div className="text-right pt-2">
          <h2 className="text-xl font-semibold text-gray-700">Informe de Desempeño</h2>
          <p className="text-md text-gray-600">{period}</p>
        </div>
      </header>
      
      <section className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 text-sm">
         <div>
            <span className="font-semibold text-gray-500">Estudiante: </span>
            <span className='text-gray-800'>{student.firstName} {student.lastName}</span>
        </div>
        <div>
            <span className="font-semibold text-gray-500">Documento: </span>
             <span className='text-gray-800'>{student.documentType} {student.documentNumber}</span>
        </div>
        <div>
            <span className="font-semibold text-gray-500">Grado: </span>
             <span className='text-gray-800'>{student.gradeLevel}</span>
        </div>
      </section>

      <section className="my-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className='border-b-2 border-gray-200'>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase">{isPreschool ? 'Dimensión' : 'Asignatura'}</th>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase" style={{width: '60%'}}>Logros y Observaciones</th>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-center" style={{width: '15%'}}>{isPreschool ? 'Desempeño' : 'Calificación'}</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 align-top">
                <td className="p-3 font-medium text-gray-800">{item.subject}</td>
                <td className="p-3 text-gray-600 text-sm">{item.competency}</td>
                <td className={cn("p-3 text-center text-sm", getGradeColorClass(item.grade))}>
                  {item.grade}
                </td>
              </tr>
            ))}
             {grades.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center p-8 text-gray-500">No hay calificaciones registradas para este período.</td>
                </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className='mt-12'>
        <h3 className="text-md font-semibold text-gray-700 mb-4">Observaciones Generales</h3>
        <div className='h-24 border-b-2 border-gray-300'></div>
      </section>

      <section className="mt-24 grid grid-cols-2 gap-24 text-center">
        <div>
            <div className="border-t-2 border-gray-400 w-2/3 mx-auto pt-2">
                <p className="text-sm font-semibold">{teacherName}</p>
                <p className="text-xs text-gray-600">Director de Grupo</p>
            </div>
        </div>
         <div>
            <div className="border-t-2 border-gray-400 w-2/3 mx-auto pt-2">
                <p className="text-sm font-semibold">{schoolSettings.rectorName}</p>
                <p className="text-xs text-gray-600">Rector(a)</p>
            </div>
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500 pt-12 mt-8 border-t">
        <p>{schoolSettings.address} - Tel: {schoolSettings.phone} - Email: {schoolSettings.email}</p>
        <p>Generado el {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </footer>
    </div>
  );
}
