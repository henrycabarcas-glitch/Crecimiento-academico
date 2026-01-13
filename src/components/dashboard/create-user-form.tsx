
'use client';
import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc } from 'firebase/firestore';
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
import { useFirestore, useAuth } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';
import { UserRole } from '@/lib/types';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  email: z.string().email('Email inválido.'),
  photoUrl: z.string().optional(),
  role: z.enum(['Profesor', 'Director', 'Directivo Docente', 'Administrador'], {
    required_error: 'El rol es requerido.',
  }),
});

type CreateUserFormValues = z.infer<typeof formSchema>;

interface CreateUserFormProps {
  onUserCreated: (createPromise: Promise<any>) => void;
  isInitialAdmin?: boolean;
  isSubmitting?: boolean;
}

export function CreateUserForm({ onUserCreated, isInitialAdmin = false, isSubmitting = false }: CreateUserFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
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


  const onSubmit = (values: CreateUserFormValues) => {
    const createPromise = (async () => {
        try {
            const tempPassword = Math.random().toString(36).slice(-8);
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, tempPassword);
            const { uid } = userCredential.user;

            const collectionName = 'teachers';
            const newDocRef = doc(firestore, collectionName, uid);
            
            const userData = {
                id: newDocRef.id,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                photoUrl: values.photoUrl || '',
                role: values.role as UserRole,
            };
            
            await setDoc(newDocRef, userData);

            await sendPasswordResetEmail(auth, values.email);
            
            toast({
                title: '¡Usuario Creado!',
                description: `La cuenta para ${values.email} ha sido creada. Se ha enviado un correo para que establezca su contraseña.`,
            });

            form.reset();
        } catch (error: any) {
            console.error('Error creating user:', error);
            let description = 'No se pudo crear el usuario. Verifique la consola para más detalles.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'Este correo electrónico ya está en uso. Por favor, utilice otro.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'El formato del correo electrónico no es válido.';
            }

            toast({
                variant: 'destructive',
                title: 'Error de Creación',
                description,
            });
            // Do not re-throw the error, as it's handled by the toast.
        }
    })();

    onUserCreated(createPromise);
  };
  

  return (
    <>
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
              <div>
                <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    disabled={isSubmitting}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                >
                    Subir Foto
                </Button>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Carmen" {...field} disabled={isSubmitting} />
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
                    <Input placeholder="Ej: Díaz" {...field} disabled={isSubmitting}/>
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
                  <Input type="email" placeholder="ejemplo@correo.com" {...field} disabled={isSubmitting}/>
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isInitialAdmin || isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Profesor">Profesor</SelectItem>
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
              <Button type="button" variant="ghost" onClick={() => onUserCreated(Promise.reject(new Error('Cancelled by user')))} disabled={isSubmitting}>
                  Cancelar
                </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isInitialAdmin ? 'Crear Perfil de Administrador' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
