'use client';
import { useState } from 'react';
import Image from 'next/image';
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Loader2, PlusCircle, Trash2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateStudentDialog } from '@/components/dashboard/create-student-dialog';
import { EditStudentDialog } from '@/components/dashboard/edit-student-dialog';
import { WithId, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { Student, Parent } from '@/lib/types';
import { DeleteConfirmationDialog } from '@/components/dashboard/delete-confirmation-dialog';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const studentsData: (Student & { parents: Parent[] })[] = [
    { id: "S001", firstName: "Sofía", lastName: "Rodriguez", photoUrl: "https://images.unsplash.com/photo-1633322007934-4e0dd1213397?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjaGlsZCUyMHNtaWxpbmd8ZW58MHx8fHwxNzY2MTQ4NTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080", gradeLevel: "Jardín", parentIds: ["P001"], parents: [{id: 'P001', firstName: "Luisa", lastName: "Fernandez", email: "luisa.f@example.com"}], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S002", firstName: "Mateo", lastName: "Garcia", photoUrl: "https://images.unsplash.com/photo-1595760780346-f972eb49709f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjaGlsZCUyMHBvcnRyYWl0fGVufDB8fHx8MTc2NjA2MzYzOHww&ixlib=rb-4.1.0&q=80&w=1080", gradeLevel: "Jardín", parentIds: ["P002"], parents: [{id: 'P002', firstName: "Carlos", lastName: "Garcia", email: "carlos.g@example.com"}], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S003", firstName: "Valentina", lastName: "Martinez", gradeLevel: "Transición", parentIds: ["P003"], parents: [{id: 'P003', firstName: "Maria", lastName: "Martinez", email: "maria.m@example.com"}], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: '' },
    { id: "S004", firstName: "Santiago", lastName: "Lopez", gradeLevel: "Transición", parentIds: ["P004"], parents: [{id: 'P004', firstName: "Juan", lastName: "Lopez", email: "juan.l@example.com"}], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: '' },
    { id: "S005", firstName: "Isabella", lastName: "Gonzalez", gradeLevel: "Pre-jardín", parentIds: ["P005"], parents: [{id: 'P005', firstName: "Sofia", lastName: "Gonzalez", email: "sofia.g@example.com"}], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
];


export default function StudentsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const isLoading = false;
  const students = studentsData;

  const [isCreateStudentDialogOpen, setCreateStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
  const [isDeleteStudentDialogOpen, setDeleteStudentDialogOpen] = useState(false);
  const [studentToAction, setStudentToAction] = useState<WithId<Student> | null>(null);
  const [isDeleteLoading, setDeleteLoading] = useState(false);


  const handleEditClick = (student: WithId<Student>) => {
    setStudentToAction(student);
    setEditStudentDialogOpen(true);
  };

  const handleDeleteClick = (student: WithId<Student>) => {
    setStudentToAction(student);
    setDeleteStudentDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToAction) return;
    setDeleteLoading(true);

    try {
      const studentRef = doc(firestore, 'students', studentToAction.id);
      deleteDocumentNonBlocking(studentRef);

      toast({
        title: '¡Estudiante Eliminado!',
        description: `${studentToAction.firstName} ${studentToAction.lastName} ha sido eliminado.`,
      });

      setDeleteStudentDialogOpen(false);
      setStudentToAction(null);
    } catch (error) {
      console.error("Error deleting student: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el estudiante.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Gestión de Estudiantes" />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-end gap-2 fade-in-up">
              <Button onClick={() => setCreateStudentDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Estudiante
              </Button>
              <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar SIMAT
              </Button>
          </div>
          <Card className="fade-in-up" style={{ animationDelay: '150ms' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Acudiente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Cargando estudiantes...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students?.map((student) => {
                    const parent = student.parents?.[0];

                    return (
                      <TableRow key={student.id} className="transition-colors hover:bg-muted/80">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {student.photoUrl ? (
                                <AvatarImage src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} />
                              ) : (
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.gradeLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>{parent ? `${parent.firstName} ${parent.lastName}`: 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{parent?.email || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleEditClick(student)}>
                                Editar Estudiante
                              </DropdownMenuItem>
                              <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                              <DropdownMenuItem>Ver Boletín</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleDeleteClick(student)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
      <CreateStudentDialog
        isOpen={isCreateStudentDialogOpen}
        onOpenChange={setCreateStudentDialogOpen}
      />
      {studentToAction && (
        <EditStudentDialog
          student={studentToAction}
          isOpen={isEditStudentDialogOpen}
          onOpenChange={setEditStudentDialogOpen}
        />
      )}
      {studentToAction && (
        <DeleteConfirmationDialog
          isOpen={isDeleteStudentDialogOpen}
          onOpenChange={setDeleteStudentDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleteLoading}
          title={`¿Eliminar a ${studentToAction.firstName}?`}
          description="Esta acción es irreversible y eliminará permanentemente al estudiante del sistema."
        />
      )}
    </>
  );
}
