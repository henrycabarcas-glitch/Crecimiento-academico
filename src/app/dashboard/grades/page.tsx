'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileDown, Filter, Loader2, User, FileText, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Card, CardContent } from "@/components/ui/card";
import { Student } from "@/lib/types";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useStudents } from '@/hooks/use-students';
import { Checkbox } from '@/components/ui/checkbox';


// Mock data structure representing student grades with performance levels and associated achievements.
const gradesData: Record<string, Record<string, { term: string; grade: string | number; competency: string }>> = {
    "S001": { // Sofía Rodriguez - Jardín
        "Dimensión Comunicativa": { term: "Trimestre 1", grade: "Superior", competency: "Identifica las vocales y su sonido." },
        "Dimensión Cognitiva": { term: "Trimestre 1", grade: "Alto", competency: "Cuenta objetos hasta el número 20." }
    },
    "S002": { // Mateo Garcia - Jardín
        "Dimensión Comunicativa": { term: "Trimestre 1", grade: "Alto", competency: "Reconoce su nombre escrito." },
        "Dimensión Corporal": { term: "Trimestre 1", grade: "Básico", competency: "Muestra dificultad para atarse los cordones." }
    },
    "S003": { // Valentina Martinez - Transición
        "Dimensión Comunicativa": { term: "Trimestre 1", grade: "Superior", competency: "Escribe su nombre sin ayuda." },
        "Dimensión Cognitiva": { term: "Trimestre 1", grade: "Superior", competency: "Clasifica objetos por color y forma." }
    },
    "S007": { // Camila Perez - Primero
        "Matemáticas 1": { term: "Trimestre 1", grade: 4.5, competency: "Resuelve sumas simples." },
        "Lenguaje 1": { term: "Trimestre 1", grade: 5.0, competency: "Lee frases cortas con fluidez." }
    },
    "S008": { // Sebastian Gomez - Primero
        "Matemáticas 1": { term: "Trimestre 1", grade: 3.2, competency: "Requiere apoyo en la resolución de restas." },
        "Lenguaje 1": { term: "Trimestre 1", grade: 3.8, competency: "Identifica personajes principales en un cuento." }
    },
};

const subjectsByGrade: Record<string, string[]> = {
    'Pre-jardín': ['Dimensión Comunicativa', 'Dimensión Cognitiva', 'Dimensión Corporal', 'Dimensión Socio-Afectiva'],
    'Jardín': ['Dimensión Comunicativa', 'Dimensión Cognitiva', 'Dimensión Corporal', 'Dimensión Estética'],
    'Transición': ['Dimensión Comunicativa', 'Dimensión Cognitiva', 'Dimensión Corporal'],
    'Primero': ['Matemáticas 1', 'Lenguaje 1', 'Ciencias Naturales 1', 'Ciencias Sociales 1'],
    'Segundo': ['Matemáticas 2', 'Lenguaje 2', 'Ciencias Naturales 2', 'Ciencias Sociales 2'],
    'Tercero': ['Matemáticas 3', 'Lenguaje 3', 'Ciencias Naturales 3', 'Ciencias Sociales 3'],
    'Cuarto': ['Matemáticas 4', 'Lenguaje 4', 'Ciencias Naturales 4', 'Ciencias Sociales 4'],
    'Quinto': ['Matemáticas 5', 'Lenguaje 5', 'Ciencias Naturales 5', 'Ciencias Sociales 5'],
};

const performanceLevels = ["Superior", "Alto", "Básico", "Bajo"];
const preschoolGrades = ['Pre-jardín', 'Jardín', 'Transición'];

const getGradeColorClass = (grade?: string | number) => {
    if (typeof grade === 'string') {
        switch(grade) {
            case 'Superior': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
            case 'Alto': return 'bg-blue-100 text-blue-900 border-blue-200';
            case 'Básico': return 'bg-yellow-100 text-yellow-900 border-yellow-200';
            case 'Bajo': return 'bg-red-100 text-red-900 font-bold border-red-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    }
    if (typeof grade === 'number') {
        if (grade >= 4.6) return 'bg-emerald-100 text-emerald-900 border-emerald-200';
        if (grade >= 4.0) return 'bg-blue-100 text-blue-900 border-blue-200';
        if (grade >= 3.0) return 'bg-yellow-100 text-yellow-900 border-yellow-200';
        if (grade >= 1.0) return 'bg-red-100 text-red-900 font-bold border-red-200';
    }
    return 'bg-gray-100 text-gray-500 border-gray-200';
}

export default function GradesPage() {
  const { data: allStudents, isLoading } = useStudents();
  const [localGrades, setLocalGrades] = useState(gradesData);
  const [selectedGrade, setSelectedGrade] = useState<string>("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Trimestre 1");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const students = useMemo(() => {
    if (!allStudents) return [];
    if (selectedGrade === "todos") return allStudents;
    return allStudents.filter((student) => student.gradeLevel === selectedGrade);
  }, [allStudents, selectedGrade]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedStudentIds(students.map(s => s.id));
    } else {
        setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
        setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const displayedSubjects = useMemo(() => {
    if (selectedGrade === 'todos') {
        const subjectsInView = students.reduce((acc, student) => {
            const studentSubjects = subjectsByGrade[student.gradeLevel] || [];
            return new Set([...acc, ...studentSubjects]);
        }, new Set<string>());
        return Array.from(subjectsInView).sort();
    }
    return subjectsByGrade[selectedGrade] || [];
  }, [selectedGrade, students]);


  const handleGradeChange = (studentId: string, subject: string, newGrade: string | number) => {
    setLocalGrades(prevGrades => ({
        ...prevGrades,
        [studentId]: {
            ...prevGrades[studentId],
            [subject]: {
                ...prevGrades[studentId]?.[subject],
                grade: newGrade,
                competency: prevGrades[studentId]?.[subject]?.competency || 'Competencia por definir',
                term: selectedPeriod,
            }
        }
    }));
  };

  const renderGradeInput = (student: Student, subject: string) => {
    const gradeInfo = localGrades[student.id]?.[subject];
    const isPreschool = preschoolGrades.includes(student.gradeLevel);

    if (isPreschool) {
      return (
        <Select
            value={gradeInfo?.grade as string || ''}
            onValueChange={(newGrade) => handleGradeChange(student.id, subject, newGrade)}
        >
            <SelectTrigger className={cn("w-32 mx-auto border bg-transparent focus:ring-0 focus:ring-offset-0", getGradeColorClass(gradeInfo?.grade))}>
                <SelectValue placeholder="N/A" />
            </SelectTrigger>
            <SelectContent>
                {performanceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      );
    } else {
        return (
            <Input
                type="number"
                value={gradeInfo?.grade ?? ''}
                onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string to clear the input, otherwise parse as float
                    const numericValue = value === '' ? '' : parseFloat(value);
                    if (numericValue === '' || (numericValue >= 1.0 && numericValue <= 5.0)) {
                         handleGradeChange(student.id, subject, numericValue);
                    }
                }}
                min="1.0"
                max="5.0"
                step="0.1"
                className={cn("w-24 mx-auto text-center border focus:ring-ring focus:ring-2", getGradeColorClass(gradeInfo?.grade as number))}
            />
        );
    }
  }

  const batchPrintUrl = `/dashboard/grades/batch-reports?period=${selectedPeriod}&studentIds=${selectedStudentIds.join(',')}`;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <PageHeader title="Libro de Calificaciones Digital" />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <Card className="fade-in-up">
              <CardContent className="pt-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Filtros</h3>
                  </div>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar Clase" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="todos">Todas las Clases</SelectItem>
                          <SelectItem value="Pre-jardín">Pre-jardín</SelectItem>
                          <SelectItem value="Jardín">Jardín</SelectItem>
                          <SelectItem value="Transición">Transición</SelectItem>
                          <SelectItem value="Primero">Primero</SelectItem>
                          <SelectItem value="Segundo">Segundo</SelectItem>
                          <SelectItem value="Tercero">Tercero</SelectItem>
                          <SelectItem value="Cuarto">Cuarto</SelectItem>
                          <SelectItem value="Quinto">Quinto</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar Periodo" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                          <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                          <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                      </SelectContent>
                  </Select>
                  <div className="ml-auto flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" disabled={selectedStudentIds.length === 0}>
                         <Link href={batchPrintUrl} target="_blank">
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir Selección ({selectedStudentIds.length})
                          </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                          <FileDown className="mr-2 h-4 w-4" />
                          Guardar Notas
                      </Button>
                  </div>
              </CardContent>
          </Card>
          
          <div className="border rounded-lg overflow-hidden fade-in-up" style={{animationDelay: '150ms'}}>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead className="w-[50px] sticky left-0 bg-card z-10 px-4">
                        <Checkbox 
                            checked={selectedStudentIds.length > 0 && selectedStudentIds.length === students.length}
                            onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[300px] sticky left-12 bg-card z-10">Estudiante</TableHead>
                      {displayedSubjects.map(subject => (
                          <TableHead key={subject} className="text-center min-w-[170px]">{subject}</TableHead>
                      ))}
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={displayedSubjects.length + 2} className="text-center">
                        <div className="flex justify-center items-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Cargando...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : students?.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <TableRow key={student.id} className="transition-colors hover:bg-muted/50" data-state={isSelected ? "selected" : ""}>
                         <TableCell className="sticky left-0 bg-card z-10 px-4">
                            <Checkbox 
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                            />
                         </TableCell>
                        <TableCell className="sticky left-12 bg-card z-10 font-medium">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    {student.photoUrl ? (
                                        <AvatarImage src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} />
                                    ) : (
                                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="whitespace-nowrap">{student.firstName} {student.lastName}</div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button asChild variant="ghost" size="icon">
                                    <Link href={`/dashboard/grades/report-card/${student.id}?period=${selectedPeriod}`} target="_blank">
                                        <FileText className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generar Boletín</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                        </TableCell>
                        {displayedSubjects.map(subject => {
                            const gradeInfo = localGrades[student.id]?.[subject];
                            const isApplicable = subjectsByGrade[student.gradeLevel]?.includes(subject);

                            return (
                                <TableCell key={subject} className={cn("text-center p-1 align-middle", !isApplicable && "bg-gray-50")}>
                                   {isApplicable ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className='w-full flex justify-center'>
                                                    {renderGradeInput(student, subject)}
                                                </div>
                                            </TooltipTrigger>
                                            {gradeInfo?.competency && (
                                                <TooltipContent>
                                                    <p className="max-w-xs">{gradeInfo.competency}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                   ): (
                                     <div className="h-10"></div>
                                   )}
                                </TableCell>
                            )
                        })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
