'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
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
import { useFirestore } from '@/firebase';
import { Loader2, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '@/lib/types';

const formSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  email: z.string().email('Email inválido.'),
  photoUrl: z.string().optional(),
  role: z.enum(['Profesor', 'Acudiente', 'Director', 'Directivo Docente', 'Administrador'], {
    required_error: 'El rol es requerido.',
  }),
});

type EditUserFormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        photoUrl: '',
        role: 'Profesor',
    }
  });

  const photoUrl = form.watch("photoUrl");

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photoUrl: user.photoUrl || '',
        role: user.role,
      });
    }
  }, [user, isOpen, form]);
  
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

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userRef = doc(firestore, user.sourceCollection, user.id);
      
      const dataToUpdate: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        photoUrl: values.photoUrl,
      };

      if (user.sourceCollection === 'teachers') {
        dataToUpdate.role = values.role;
      }
      
      await updateDoc(userRef, dataToUpdate);
      
      toast({
        title: '¡Usuario Actualizado!',
        description: `La información de ${values.firstName} ha sido actualizada.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el usuario. Por favor, inténtelo de nuevo.',
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
  
  const isParent = user?.sourceCollection === 'parents';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualice la información del usuario. El email no se puede cambiar si el usuario ya se ha autenticado.
          </DialogDescription>
        </DialogHeader>
        {user && (
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
                    <FormField
                        control={form.control}
                        name="photoUrl"
                        render={({ field }) => (
                            <FormItem>
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
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Cambiar Foto
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
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
                        <Input type="email" placeholder="ejemplo@correo.com" {...field} disabled />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isParent}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Profesor">Profesor</SelectItem>
                        <SelectItem value="Acudiente" disabled>Acudiente</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Directivo Docente">Directivo Docente</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
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
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
