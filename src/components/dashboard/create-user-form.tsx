'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useAuth, initiateEmailSignUp } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';

const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
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
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: isInitialAdmin ? 'Administrador' : undefined,
    },
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    setIsLoading(true);
    try {
      // This function now ONLY creates the authentication user.
      // The Firestore document creation is decoupled to avoid permission issues.
      // The admin can later create the corresponding Firestore document in the UI.
      await initiateEmailSignUp(auth, values.email, values.password);

      toast({
        title: '¡Cuenta Creada!',
        description: `La cuenta para ${values.email} ha sido creada. Ahora debe crear el perfil de usuario en la base de datos.`,
      });
      form.reset();
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      let description = 'No se pudo crear el usuario. Por favor, inténtelo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'El correo electrónico ya está en uso por otra cuenta.';
      } else if (error.code === 'auth/admin-restricted-operation') {
        description = 'Esta operación está restringida a administradores. Asegúrese de tener los permisos correctos.';
      }
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
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
            {isInitialAdmin ? 'Crear Cuenta de Administrador' : 'Crear Cuenta'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
