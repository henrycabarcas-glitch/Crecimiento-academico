'use client';
import { useState, useRef } from 'react';
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
import { useFirestore } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';
import { UserRole } from '@/lib/types';
import { createAuthUser } from '@/ai/flows/user-management-flow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


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
  onUserCreated?: () => void;
  onOpenChange: (isOpen: boolean) => void;
  isInitialAdmin?: boolean;
}

export function CreateUserForm({ onUserCreated, onOpenChange, isInitialAdmin = false }: CreateUserFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
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
    setIsSubmitting(true);
    try {
        // Step 1: Call the server flow to create the Auth user and get UID + password
        const { uid, password } = await createAuthUser({
          email: values.email,
          displayName: `${values.firstName} ${values.lastName}`,
          photoUrl: values.photoUrl
        });

        // Step 2: Create the user profile in Firestore
        const isTeacher = ['Profesor', 'Director', 'Directivo Docente', 'Administrador'].includes(values.role);
        const collectionName = isTeacher ? 'teachers' : 'parents';
        
        const newDocRef = doc(firestore, collectionName, uid);
        
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
        
        await setDoc(newDocRef, userData);
        
        setGeneratedPassword(password);
        
        toast({
            title: '¡Usuario Creado!',
            description: `La cuenta para ${values.email} ha sido creada.`,
        });

        onUserCreated?.(); // Callback for special cases like initial admin creation
        setShowPasswordDialog(true); // Show password, which will pause the flow

    } catch (error: any) {
        console.error('Error creating user:', error);
        let description = 'No se pudo crear el usuario. Verifique la consola del servidor para más detalles.';
        if (error.message.includes('EMAIL_EXISTS')) {
            description = 'Este correo electrónico ya está en uso. Por favor, utilice otro.';
        }

        toast({
            variant: 'destructive',
            title: 'Error de Creación',
            description,
        });
        setIsSubmitting(false); // Make sure to stop loading on error
    }
    // Do NOT set isSubmitting to false here, it's handled in the dialog close or after error
  };
  
  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setIsSubmitting(false);
    form.reset();
    onOpenChange(false); // Now we close the main dialog
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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
      
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contraseña Temporal del Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, copie esta contraseña y entréguesela al nuevo usuario. Deberá usarla para su primer inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-muted rounded-md text-center">
            <code className="text-lg font-mono font-bold tracking-widest">{generatedPassword}</code>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClosePasswordDialog}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
