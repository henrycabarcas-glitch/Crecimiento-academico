'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { Student } from '@/lib/types';
import { WithId } from '@/firebase';

const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida.'),
  gradeLevel: z.string().min(1, 'El grado es requerido.'),
});

type EditStudentFormValues = z.infer<typeof formSchema>;

interface EditStudentDialogProps {
  student: WithId<Student>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditStudentDialog({
  student,
  isOpen,
  onOpenChange,
}: EditStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const photoUrl = form.watch("photoUrl");

  useEffect(() => {
    if (student) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        photoUrl: student.photoUrl || '',
        dateOfBirth: student.dateOfBirth,
        gradeLevel: student.gradeLevel,
      });
    }
  }, [student, form]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (values: EditStudentFormValues) => {
    if (!student) return;
    setIsLoading(true);
    try {
      const studentRef = doc(firestore, 'students', student.id);
      
      updateDocumentNonBlocking(studentRef, values);

      toast({
        title: '¡Estudiante Actualizado!',
        description: `${values.firstName} ${values.lastName} ha sido actualizado exitosamente.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estudiante. Por favor, inténtelo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Estudiante</DialogTitle>
          <DialogDescription>
            Actualice la información del estudiante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Ej: Ana" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Ej: García" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <div className="md:col-span-2">
                        <FormField control={form.control} name="photoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Foto del Estudiante</FormLabel>
                                <FormControl>
                                    <>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Cambiar Foto
                                        </Button>
                                    </>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                        {photoUrl ? (
                        <Image
                            src={photoUrl}
                            alt="Avatar del estudiante"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                        ) : (
                        <UserIcon className="w-16 h-16 text-muted-foreground" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Previsualización</p>
                 </div>
              </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
