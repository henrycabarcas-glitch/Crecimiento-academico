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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking, WithId } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Course } from '@/lib/types';

const formSchema = z.object({
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type CreateAchievementFormValues = z.infer<typeof formSchema>;

interface CreateAchievementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  course: WithId<Course>;
  period: string;
}

export function CreateAchievementDialog({
  isOpen,
  onOpenChange,
  course,
  period,
}: CreateAchievementDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateAchievementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (values: CreateAchievementFormValues) => {
    setIsLoading(true);
    try {
      const newAchievementRef = doc(collection(firestore, 'courses', course.id, 'achievements'));
      const newAchievement = {
        id: newAchievementRef.id,
        courseId: course.id,
        gradeLevel: course.gradeLevel,
        period: period,
        description: values.description,
      };

      setDocumentNonBlocking(newAchievementRef, newAchievement, {});

      toast({
        title: '¡Logro Creado!',
        description: `El logro ha sido añadido a ${course.name}.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el logro. Por favor, inténtelo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Logro</DialogTitle>
          <DialogDescription>
            Añadir un logro para el curso de {course.name} en el {period}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Logro</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Identifica correctamente las partes de una planta." {...field} rows={4}/>
                  </FormControl>
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
                Guardar Logro
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    