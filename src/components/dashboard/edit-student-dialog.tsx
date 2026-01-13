
'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
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
import { useFirestore, WithId } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { Student } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  photoUrl: z.string().optional(),
  documentType: z.string().min(1, "El tipo de documento es requerido."),
  documentNumber: z.string().min(1, "El número de documento es requerido."),
  expeditionCountry: z.string().optional(),
  expeditionDepartment: z.string().optional(),
  expeditionMunicipality: z.string().optional(),
  gender: z.string().min(1, "El género es requerido."),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida.'),
  birthCountry: z.string().optional(),
  birthDepartment: z.string().optional(),
  birthMunicipality: z.string().optional(),
  gradeLevel: z.string().min(1, 'El grado es requerido.'),
  previousInstitution: z.string().optional(),
  academicSituation: z.string().optional(),
  address: z.string().optional(),
  residentialZone: z.string().optional(),
  phoneNumber: z.string().optional(),
  socioeconomicStratum: z.string().optional(),
  sisbenScore: z.string().optional(),
  healthProvider: z.string().optional(),
  healthCenter: z.string().optional(),
  bloodType: z.string().optional(),
  disability: z.string().optional(),
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
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        photoUrl: student.photoUrl || '',
        documentType: student.documentType || '',
        documentNumber: student.documentNumber || '',
        expeditionCountry: student.expeditionCountry || 'Colombia',
        expeditionDepartment: student.expeditionDepartment || '',
        expeditionMunicipality: student.expeditionMunicipality || '',
        gender: student.gender || '',
        dateOfBirth: student.dateOfBirth || '',
        birthCountry: student.birthCountry || 'Colombia',
        birthDepartment: student.birthDepartment || '',
        birthMunicipality: student.birthMunicipality || '',
        gradeLevel: student.gradeLevel || '',
        previousInstitution: student.previousInstitution || 'N/A',
        academicSituation: student.academicSituation || 'Aprobado',
        address: student.address || '',
        residentialZone: student.residentialZone || '',
        phoneNumber: student.phoneNumber || '',
        socioeconomicStratum: student.socioeconomicStratum || '',
        sisbenScore: student.sisbenScore || '',
        healthProvider: student.healthProvider || '',
        healthCenter: student.healthCenter || '',
        bloodType: student.bloodType || '',
        disability: student.disability || 'Ninguna',
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
      await updateDoc(studentRef, values as any);

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Estudiante (SIMAT)</DialogTitle>
          <DialogDescription>
            Actualice la información del estudiante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
            <div className="space-y-6 p-1">
              <h3 className="font-semibold text-lg">Información Personal y Foto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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
                              <div>
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
                              </div>
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


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="documentType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Registro Civil">Registro Civil</SelectItem>
                              <SelectItem value="Tarjeta de Identidad">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="Cédula de Extranjería">Cédula de Extranjería</SelectItem>
                              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                    <FormItem><FormLabel>Número de Documento</FormLabel><FormControl><Input placeholder="Ej: 1029384756" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un género" /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="expeditionCountry" render={({ field }) => (
                  <FormItem><FormLabel>País de Expedición</FormLabel><FormControl><Input placeholder="Ej: Colombia" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="expeditionDepartment" render={({ field }) => (
                  <FormItem><FormLabel>Departamento de Expedición</FormLabel><FormControl><Input placeholder="Ej: Cundinamarca" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="expeditionMunicipality" render={({ field }) => (
                  <FormItem><FormLabel>Municipio de Expedición</FormLabel><FormControl><Input placeholder="Ej: Bogotá D.C." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                <FormField control={form.control} name="birthCountry" render={({ field }) => (
                  <FormItem><FormLabel>País de Nacimiento</FormLabel><FormControl><Input placeholder="Ej: Colombia" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="birthDepartment" render={({ field }) => (
                  <FormItem><FormLabel>Dep. de Nacimiento</FormLabel><FormControl><Input placeholder="Ej: Cundinamarca" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              
              <Separator className="my-6" />

              <h3 className="font-semibold text-lg">Información Académica y Residencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="gradeLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado a Matricular</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un grado" /></SelectTrigger></FormControl>
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
                )}/>
                <FormField control={form.control} name="previousInstitution" render={({ field }) => (
                  <FormItem><FormLabel>Institución Anterior</FormLabel><FormControl><Input placeholder="Nombre del colegio anterior" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="academicSituation" render={({ field }) => (
                   <FormItem>
                      <FormLabel>Situación Académica Anterior</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Aprobado">Aprobado</SelectItem>
                              <SelectItem value="Reprobado">Reprobado</SelectItem>
                              <SelectItem value="Nuevo">Nuevo (Sin escolaridad)</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Ej: Cra 5 #10-2" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Ej: 3001234567" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="residentialZone" render={({ field }) => (
                   <FormItem>
                      <FormLabel>Zona Residencial</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione zona" /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Urbana">Urbana</SelectItem>
                              <SelectItem value="Rural">Rural</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>

              <Separator className="my-6" />
              <h3 className="font-semibold text-lg">Información Social y de Salud</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="socioeconomicStratum" render={({ field }) => (
                  <FormItem><FormLabel>Estrato</FormLabel><FormControl><Input placeholder="Ej: 3" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="sisbenScore" render={({ field }) => (
                  <FormItem><FormLabel>SISBEN</FormLabel><FormControl><Input placeholder="Ej: C5" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="disability" render={({ field }) => (
                  <FormItem><FormLabel>Discapacidad</FormLabel><FormControl><Input placeholder="Ej: Ninguna" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="healthProvider" render={({ field }) => (
                  <FormItem><FormLabel>EPS</FormLabel><FormControl><Input placeholder="Ej: Sura" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="healthCenter" render={({ field }) => (
                  <FormItem><FormLabel>IPS Primaria</FormLabel><FormControl><Input placeholder="Ej: Clínica Las Américas" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="bloodType" render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Sangre</FormLabel><FormControl><Input placeholder="Ej: O+" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
            </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
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
