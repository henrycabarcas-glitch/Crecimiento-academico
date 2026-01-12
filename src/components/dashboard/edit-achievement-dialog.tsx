
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
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
import { useFirestore, WithId } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Achievement, Course } from '@/lib/types';

const formSchema = z.object({
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type EditAchievementFormValues = z.infer<typeof formSchema>;

interface EditAchievementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  achievement: WithId<Achievement>;
  course: WithId<Course>;
}

export function EditAchievementDialog({
  isOpen,
  onOpenChange,
  achievement,
  course,
}: EditAchievementDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditAchievementFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (achievement) {
        form.reset({
            description: achievement.description,
        });
    }
  }, [achievement, form]);

  const onSubmit = async (values: EditAchievementFormValues) => {
    setIsLoading(true);
    try {
      const achievementRef = doc(firestore, 'courses', course.id, 'achievements', achievement.id);
      
      await updateDoc(achievementRef, {
        description: values.description,
      });

      toast({
        title: '¡Logro Actualizado!',
        description: 'La descripción del logro ha sido modificada.',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el logro. Por favor, inténtelo de nuevo.',
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Logro</DialogTitle>
          <DialogDescription>
            Modificar el logro para el curso de {course.name}.
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
                    <Textarea placeholder="Describa el logro o indicador..." {...field} rows={5}/>
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
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
