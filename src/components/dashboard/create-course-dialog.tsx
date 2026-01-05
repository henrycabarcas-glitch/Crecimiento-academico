'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useTeachers } from '@/hooks/use-teachers';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  description: z.string().optional(),
  teacherId: z.string().min(1, 'El profesor es requerido.'),
  gradeLevel: z.string().min(1, 'El grado es requerido.'),
});

type CreateCourseFormValues = z.infer<typeof formSchema>;

interface CreateCourseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const preschoolGrades = ['Pre-jardín', 'Jardín', 'Transición'];
const preschoolDimensions = [
    'Dimensión Corporal',
    'Dimensión Cognitiva',
    'Dimensión Comunicativa',
    'Dimensión Estética',
    'Dimensión Socio-Afectiva',
];

export function CreateCourseDialog({
  isOpen,
  onOpenChange,
}: CreateCourseDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: teachers, isLoading: isLoadingTeachers } = useTeachers();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      teacherId: '',
      gradeLevel: '',
    },
  });

  const selectedGrade = form.watch('gradeLevel');
  const isPreschool = preschoolGrades.includes(selectedGrade);

  const onSubmit = async (values: CreateCourseFormValues) => {
    setIsLoading(true);
    try {
      const newCourseRef = doc(collection(firestore, 'courses'));
      const newCourse = {
        id: newCourseRef.id,
        ...values,
        studentIds: [],
      };

      setDocumentNonBlocking(newCourseRef, newCourse, {});

      toast({
        title: '¡Curso Creado!',
        description: `${values.name} ha sido creado exitosamente.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el curso. Por favor, inténtelo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo curso o dimensión.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('name', '');
                  }} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Seleccione un grado" />
                          </SelectTrigger>
                      </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPreschool ? (
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dimensión Curricular</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una dimensión" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {preschoolDimensions.map(dim => (
                                        <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Curso</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Matemáticas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del contenido del curso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTeachers}>
                      <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder={isLoadingTeachers ? "Cargando..." : "Asignar un profesor"} />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {teachers?.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.firstName} {teacher.lastName}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingTeachers}>
                {(isLoading || isLoadingTeachers) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Curso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
