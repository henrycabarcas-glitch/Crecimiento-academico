
'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, writeBatch } from 'firebase/firestore';
import Image from 'next/image';
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
import { useFirestore } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';
import { UserRole } from '@/lib/types';


const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  email: z.string().email('Email inválido.'),
  photoUrl: z.string().optional(),
  role: z.enum(['Profesor', 'Acudiente', 'Director', 'Directivo Docente', 'Administrador'], {
    required_error: 'El rol es requerido.',
  }),
});

type CreateUserFormValues = z.infer<typeof formSchema>;

interface CreateUserFormProps {
  onUserCreated: () => void;
  isInitialAdmin?: boolean;
}

export function CreateUserForm({ onUserCreated, isInitialAdmin = false }: CreateUserFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      photoUrl: '',
      role: isInitialAdmin ? 'Administrador' : undefined,
    },
  });

  const photoUrl = form.watch("photoUrl");

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


  const onSubmit = async (values: CreateUserFormValues) => {
    setIsLoading(true);
    try {
      const isTeacher = ['Profesor', 'Director', 'Directivo Docente', 'Administrador'].includes(values.role);
      const collectionName = isTeacher ? 'teachers' : 'parents';
      
      const newDocRef = doc(collection(firestore, collectionName));
      
      const userData: any = {
        id: newDocRef.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        photoUrl: values.photoUrl,
      };

      if (isTeacher) {
        userData.role = values.role as UserRole;
      } else {
        userData.studentIds = []; // Parents need a studentIds array
      }

      await writeBatch(firestore).set(newDocRef, userData).commit();

      toast({
        title: '¡Perfil Creado!',
        description: `El perfil para ${values.email} ha sido creado. El usuario ahora debe registrarse con este email.`,
      });
      form.reset();
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      let description = 'No se pudo crear el perfil del usuario. Por favor, inténtelo de nuevo.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                <Image
                    src={photoUrl}
                    alt="Avatar del usuario"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                />
                ) : (
                <UserIcon className="w-12 h-12 text-muted-foreground" />
                )}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
            >
                Subir Foto
            </Button>
            <Input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoChange}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Carmen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Díaz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ejemplo@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isInitialAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Profesor">Profesor</SelectItem>
                  <SelectItem value="Acudiente">Acudiente</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Directivo Docente">Directivo Docente</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className={isInitialAdmin ? 'pt-4' : ''}>
          {!isInitialAdmin && (
             <Button type="button" variant="ghost" onClick={onUserCreated}>
                Cancelar
              </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isInitialAdmin ? 'Crear Perfil de Administrador' : 'Crear Perfil'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
