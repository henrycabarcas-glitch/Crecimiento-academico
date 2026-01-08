
'use client';
import { useState, useCallback } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { CreateCourseDialog } from '@/components/dashboard/create-course-dialog';
import { Course } from '@/lib/types';
import { useCourses } from '@/hooks/use-courses';


export default function CurriculumPage() {
  const [isCreateCourseDialogOpen, setCreateCourseDialogOpen] = useState(false);
  const { data: courses, isLoading } = useCourses();

  const handleSetCreateCourseDialogOpen = useCallback((isOpen: boolean) => {
    setCreateCourseDialogOpen(isOpen);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Planificación Curricular" />
        <main className="flex-1 space-y-6 p-4 md:p-6">
           <div className="flex items-center justify-end gap-2">
              <Button onClick={() => setCreateCourseDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Curso
              </Button>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Curso</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Profesor Asignado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Cargando cursos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{course.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.gradeLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'No asignado'}
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
                              <DropdownMenuItem>Editar Curso</DropdownMenuItem>
                              <DropdownMenuItem>Asignar Estudiantes</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      <CreateCourseDialog
        isOpen={isCreateCourseDialogOpen}
        onOpenChange={handleSetCreateCourseDialogOpen}
      />
    </>
  );
}
