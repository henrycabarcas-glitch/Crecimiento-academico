
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
import { FileDown, Filter, Loader2, User, FileText, Printer, Plus, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student } from "@/lib/types";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useStudents } from '@/hooks/use-students';
import { Checkbox } from '@/components/ui/checkbox';


// Mock data structure representing student grades with performance levels and associated achievements.
const gradesData: Record<string, Record<string, { term: string; grades: (string | number)[]; final: string | number; competency: string }>> = {
    "S001": {
        "Lecto escritura": { term: "Trimestre 1", grades: ["Superior", "Alto"], final: "Superior", competency: "Identifica las vocales y su sonido." },
        "Pre matemáticas": { term: "Trimestre 1", grades: ["Alto", "Básico"], final: "Alto", competency: "Cuenta objetos hasta el número 20." }
    },
    "S002": {
        "Lecto escritura": { term: "Trimestre 1", grades: ["Alto", "Básico"], final: "Alto", competency: "Reconoce su nombre escrito." },
        "Expresión corporal": { term: "Trimestre 1", grades: ["Básico", "Bajo"], final: "Básico", competency: "Muestra dificultad para atarse los cordones." }
    },
    "S003": {
        "Lecto escritura": { term: "Trimestre 1", grades: ["Superior", "Alto"], final: "Superior", competency: "Escribe su nombre sin ayuda." },
        "Pre matemáticas": { term: "Trimestre 1", grades: ["Superior", "Superior"], final: "Superior", competency: "Clasifica objetos por color y forma." }
    },
    "S007": {
        "Matemáticas 1": { term: "Trimestre 1", grades: [4.5, 4.2], final: 4.4, competency: "Resuelve sumas simples." },
        "Lenguaje 1": { term: "Trimestre 1", grades: [5.0, 4.8], final: 4.9, competency: "Lee frases cortas con fluidez." }
    },
    "S008": {
        "Matemáticas 1": { term: "Trimestre 1", grades: [3.2, 3.0], final: 3.1, competency: "Requiere apoyo en la resolución de restas." },
        "Lenguaje 1": { term: "Trimestre 1", grades: [3.8, 4.0], final: 3.9, competency: "Identifica personajes principales en un cuento." }
    },
};


const subjectsByGrade: Record<string, string[]> = {
    'Pre-jardín': ['Pre matemáticas', 'Lecto escritura', 'Ciencias integradas', 'Ingles', 'Ética y valores', 'Religión', 'Expresión corporal'],
    'Jardín': ['Pre matemáticas', 'Lecto escritura', 'Ciencias integradas', 'Ingles', 'Ética y valores', 'Religión', 'Expresión corporal'],
    'Transición': ['Pre matemáticas', 'Lecto escritura', 'Ciencias integradas', 'Ingles', 'Ética y valores', 'Religión', 'Expresión corporal'],
    'Primero': ['Matemáticas 1', 'Geometria', 'Lenguaje 1', 'Ciencias Naturales 1', 'Ciencias Sociales 1', 'Inglés', 'Tecnología', 'Etica y valores', 'Educacion fisica', 'Artistica'],
    'Segundo': ['Matemáticas 2', 'Geometria', 'Lenguaje 2', 'Ciencias Naturales 2', 'Ciencias Sociales 2', 'Inglés', 'Tecnología', 'Etica y valores', 'Educacion fisica', 'Artistica'],
    'Tercero': ['Matemáticas 3', 'Geometria', 'Lenguaje 3', 'Ciencias Naturales 3', 'Ciencias Sociales 3', 'Inglés', 'Tecnología', 'Etica y valores', 'Educacion fisica', 'Artistica'],
    'Cuarto': ['Matemáticas 4', 'Geometria', 'Lenguaje 4', 'Ciencias Naturales 4', 'Ciencias Sociales 4', 'Inglés', 'Tecnología', 'Etica y valores', 'Educacion fisica', 'Artistica'],
    'Quinto': ['Matemáticas 5', 'Geometria', 'Lenguaje 5', 'Ciencias Naturales 5', 'Ciencias Sociales 5', 'Inglés', 'Tecnología', 'Etica y valores', 'Educacion fisica', 'Artistica'],
};

const performanceLevels = ["Superior", "Alto", "Básico", "Bajo"];
const performanceLevelMap: Record<string, number> = { "Superior": 5, "Alto": 4, "Básico": 3, "Bajo": 2 };
const numericToPerformanceLevel = (grade: number): string => {
    if (grade >= 4.6) return "Superior";
    if (grade >= 4.0) return "Alto";
    if (grade >= 3.0) return "Básico";
    return "Bajo";
}
const preschoolGrades = ['Pre-jardín', 'Jardín', 'Transición'];

const getGradeColorClass = (grade?: string | number, isFinal?: boolean) => {
    let style = '';
     if (typeof grade === 'string') {
        switch(grade) {
            case 'Superior': style = 'bg-emerald-100 text-emerald-900 border-emerald-300'; break;
            case 'Alto': style = 'bg-blue-100 text-blue-900 border-blue-300'; break;
            case 'Básico': style = 'bg-yellow-100 text-yellow-900 border-yellow-400'; break;
            case 'Bajo': style = 'bg-red-100 text-red-900 font-bold border-red-300'; break;
            default: style = 'bg-gray-100 text-gray-500 border-gray-200';
        }
    } else if (typeof grade === 'number') {
        if (grade >= 4.6) style = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        else if (grade >= 4.0) style = 'bg-blue-100 text-blue-900 border-blue-300';
        else if (grade >= 3.0) style = 'bg-yellow-100 text-yellow-900 border-yellow-400';
        else if (grade >= 1.0) style = 'bg-red-100 text-red-900 font-bold border-red-300';
        else style = 'bg-gray-100 text-gray-500 border-gray-200';
    } else {
        style = 'bg-gray-100 text-gray-500 border-gray-200';
    }
    
    if (isFinal) {
        return `${style} font-bold`;
    }
    return style;
};

const getPerformanceBadge = (grade: string | number) => {
    let level: string;
    let color: string;

    if (typeof grade === 'string') {
        level = grade.charAt(0);
        switch (grade) {
            case 'Superior': color = 'bg-emerald-500'; break;
            case 'Alto': color = 'bg-blue-500'; break;
            case 'Básico': color = 'bg-yellow-500'; break;
            case 'Bajo': color = 'bg-red-500'; break;
            default: color = 'bg-gray-400';
        }
    } else {
        const perfLevel = numericToPerformanceLevel(grade);
        level = perfLevel.charAt(0);
        switch (perfLevel) {
            case 'Superior': color = 'bg-emerald-500'; break;
            case 'Alto': color = 'bg-blue-500'; break;
            case 'Básico': color = 'bg-yellow-500'; break;
            case 'Bajo': color = 'bg-red-500'; break;
            default: color = 'bg-gray-400';
        }
    }

    return (
        <div className={cn("flex items-center justify-center h-6 w-6 rounded-full text-white text-xs font-bold", color)}>
            {level}
        </div>
    )
}

export default function GradesPage() {
  const { data: allStudents, isLoading } = useStudents();
  const [localGrades, setLocalGrades] = useState(gradesData);
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  const students = useMemo(() => {
    if (!allStudents) return [];
    if (!selectedGrade) return [];
    return allStudents.filter((student) => student.gradeLevel === selectedGrade);
  }, [allStudents, selectedGrade]);
  
  const subjects = useMemo(() => {
    if (!selectedGrade) return [];
    return subjectsByGrade[selectedGrade] || [];
  }, [selectedGrade]);

  // Set default subject when subjects load
  useMemo(() => {
      if(subjects.length > 0 && !selectedSubject) {
          setSelectedSubject(subjects[0]);
      }
  }, [subjects, selectedSubject]);


  const handleGradeChange = (studentId: string, subject: string, gradeIndex: number, newGrade: string | number) => {
    setLocalGrades(prevGrades => {
        const studentGrades = prevGrades[studentId] || {};
        const subjectGrades = studentGrades[subject]?.grades || Array(2).fill('');
        const newSubjectGrades = [...subjectGrades];
        newSubjectGrades[gradeIndex] = newGrade;
        
        const isPreschool = preschoolGrades.includes(students.find(s => s.id === studentId)?.gradeLevel || '');

        let finalGrade: number | string;
        if (isPreschool) {
            const numericGrades = newSubjectGrades.map(g => performanceLevelMap[g as string] || 0).filter(g => g > 0);
            const avg = numericGrades.length > 0 ? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length : 0;
            finalGrade = numericToPerformanceLevel(avg);
        } else {
            const numericGrades = newSubjectGrades.map(g => typeof g === 'number' ? g : parseFloat(g as string)).filter(g => !isNaN(g) && g !== null);
            const avg = numericGrades.length > 0 ? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length : 0;
            finalGrade = parseFloat(avg.toFixed(1));
        }

        return {
            ...prevGrades,
            [studentId]: {
                ...studentGrades,
                [subject]: {
                    ...studentGrades[subject],
                    grades: newSubjectGrades,
                    final: finalGrade || 0,
                    competency: studentGrades[subject]?.competency || 'Competencia por definir',
                    term: 'Trimestre 1', // This should come from the selected tab
                }
            }
        }
    });
  };

  const renderGradeInput = (student: Student, subject: string, gradeIndex: number) => {
    const gradeInfo = localGrades[student.id]?.[subject];
    const grade = gradeInfo?.grades?.[gradeIndex] ?? '';
    const isPreschool = preschoolGrades.includes(student.gradeLevel);

    if (isPreschool) {
      return (
        <Select
            value={grade as string || ''}
            onValueChange={(newGrade) => handleGradeChange(student.id, subject, gradeIndex, newGrade)}
        >
            <SelectTrigger className={cn("w-28 mx-auto border text-xs h-9 bg-white focus:ring-primary focus:ring-1", getGradeColorClass(grade))}>
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
                value={grade}
                onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? '' : parseFloat(value);
                    if (numericValue === '' || (numericValue >= 1.0 && numericValue <= 5.0)) {
                         handleGradeChange(student.id, subject, gradeIndex, numericValue);
                    }
                }}
                min="1.0"
                max="5.0"
                step="0.1"
                className={cn("w-20 mx-auto text-center border h-9 focus:ring-primary focus:ring-1", getGradeColorClass(grade as number))}
            />
        );
    }
  }

  const getFinalGrade = (studentId: string, subject: string) => {
    const gradeInfo = localGrades[studentId]?.[subject];
    return gradeInfo?.final ?? (preschoolGrades.includes(students.find(s => s.id === studentId)?.gradeLevel || '') ? '' : 0);
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <PageHeader 
          title="Ingreso de Calificaciones"
          description="Seleccione un grado y una materia para registrar y promediar las notas de los estudiantes."
        />
        <main className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText className="h-6 w-6"/>
                        </span>
                        Planilla de Notas
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger className="w-[180px] h-8 text-sm">
                                <SelectValue placeholder="Seleccionar Grado" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <span className="text-gray-300">|</span>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedGrade}>
                            <SelectTrigger className="w-[180px] h-8 text-sm">
                                <SelectValue placeholder="Seleccionar Materia" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(sub => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-success text-success-foreground hover:bg-success/90">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </div>
            </div>

          <Tabs defaultValue="periodo-1" className="w-full fade-in-up">
            <TabsList>
                <TabsTrigger value="periodo-1">1° Periodo</TabsTrigger>
                <TabsTrigger value="periodo-2">2° Periodo</TabsTrigger>
                <TabsTrigger value="periodo-3">3° Periodo</TabsTrigger>
                <TabsTrigger value="periodo-4">4° Periodo</TabsTrigger>
                <TabsTrigger value="informe-final">
                    <FileText className="mr-2 h-4 w-4" />
                    Informe Final
                </TabsTrigger>
            </TabsList>
            <TabsContent value="periodo-1">
                <Card className="mt-4">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px] sticky left-0 bg-card z-10">Estudiante</TableHead>
                                        <TableHead className="text-center">Nota 1</TableHead>
                                        <TableHead className="text-center">Nota 2</TableHead>
                                        <TableHead className="text-center text-accent-foreground bg-accent/50 font-semibold">Promedio</TableHead>
                                        <TableHead className="text-center text-success bg-success/20 font-semibold">Desempeño</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-48">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                    ) : !selectedGrade || !selectedSubject ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                                Por favor, seleccione un grado y una materia para ver la planilla.
                                            </TableCell>
                                        </TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                                No hay estudiantes en el grado seleccionado.
                                            </TableCell>
                                        </TableRow>
                                    ) : students.map((student) => {
                                        const finalGrade = getFinalGrade(student.id, selectedSubject);
                                        return (
                                            <TableRow key={student.id} className="transition-colors hover:bg-muted/50">
                                                <TableCell className="sticky left-0 bg-card z-10 font-medium">
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
                                                </TableCell>
                                                {[0,1].map(i => (
                                                    <TableCell key={i} className="text-center p-2">
                                                        {renderGradeInput(student, selectedSubject, i)}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center font-bold text-accent p-2">
                                                    <div className={cn("w-20 h-9 flex items-center justify-center rounded-md text-center border mx-auto", getGradeColorClass(finalGrade, true))}>
                                                        {typeof finalGrade === 'number' && finalGrade > 0 ? finalGrade.toFixed(1) : finalGrade}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center p-2">
                                                    <div className="flex justify-center">
                                                        {finalGrade ? getPerformanceBadge(finalGrade) : null}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}

    