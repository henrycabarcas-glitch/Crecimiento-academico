'use client';
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Loader2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BehaviorLog, Student } from "@/lib/types";


const behaviorLogs: BehaviorLog[] = [
  { id: 1, studentId: "S004", date: "2024-05-10", observation: "Mostró excelente compañerismo al ayudar a un amigo.", observer: "Prof. Jorge Perez" },
  { id: 2, studentId: "S002", date: "2024-05-09", observation: "Dificultad para compartir juguetes durante el recreo.", observer: "Prof. Carmen Diaz" },
  { id: 3, studentId: "S004", date: "2024-04-22", observation: "No completó la tarea asignada en clase.", observer: "Prof. Jorge Perez" },
];

const studentsData: Student[] = [
    { id: "S001", firstName: "Sofía", lastName: "Rodriguez", gradeLevel: "Jardín", parentIds: [], enrollmentDate: '' , documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S002", firstName: "Mateo", lastName: "Garcia", gradeLevel: "Jardín", parentIds: [], enrollmentDate: '' , documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S003", firstName: "Valentina", lastName: "Martinez", gradeLevel: "Transición", parentIds: [], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: '' },
    { id: "S004", firstName: "Santiago", lastName: "Lopez", gradeLevel: "Transición", parentIds: [], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: '' },
    { id: "S005", firstName: "Isabella", lastName: "Gonzalez", gradeLevel: "Pre-jardín", parentIds: [], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
];


export default function BehaviorPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const isLoadingStudents = false;
  const students = studentsData;

  const student = students?.find(s => s.id === selectedStudentId);
  const logs = behaviorLogs.filter(l => l.studentId === selectedStudentId);

  const getStudentAvatar = (studentId?: string) => {
    if (!studentId) return { imageUrl: '', imageHint: '' };
    const studentImageId = `student-${studentId.slice(-1)}`;
    const image = PlaceHolderImages.find(img => img.id === studentImageId);
    return image || { imageUrl: '', imageHint: '' };
  };

  const { imageUrl, imageHint } = getStudentAvatar(student?.id);


  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Registro de Observación de Comportamiento" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Nueva Observación</CardTitle>
                <CardDescription>
                  Registre una nueva observación de comportamiento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="student-select" className="text-sm font-medium">Estudiante</label>
                  <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={isLoadingStudents}>
                    <SelectTrigger id="student-select">
                      <SelectValue placeholder={isLoadingStudents ? "Cargando..." : "Seleccione un estudiante"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="observation-text" className="text-sm font-medium">Observación</label>
                    <Textarea id="observation-text" placeholder="Describa el comportamiento..." />
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Registro
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                    {student && (
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={imageUrl} alt={`${student.firstName} ${student.lastName}`} data-ai-hint={imageHint}/>
                            <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        <CardTitle>Historial de Observaciones de</CardTitle>
                        <CardDescription className="text-lg font-semibold text-foreground">
                            {student ? `${student.firstName} ${student.lastName}` : 'Seleccione un estudiante'}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoadingStudents && !student ? (
                     <div className="text-center text-muted-foreground py-8">
                        Cargando...
                    </div>
                  ) : logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                         <div className="w-12 h-12 rounded-full bg-secondary flex flex-col items-center justify-center">
                            <span className="text-sm font-bold">{new Date(log.date).getDate()}</span>
                            <span className="text-xs">{new Date(log.date).toLocaleString('es-ES', { month: 'short' })}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.observation}</p>
                        <p className="text-sm text-muted-foreground">
                          Observado por {log.observer}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-8">
                        {student ? 'No se encontraron observaciones para este estudiante.' : 'Seleccione un estudiante para ver su historial.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}