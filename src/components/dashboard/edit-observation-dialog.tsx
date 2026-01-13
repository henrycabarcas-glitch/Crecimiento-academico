
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, WithId } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { BehavioralObservation, Student } from '@/lib/types';

const formSchema = z.object({
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  period: z.string().min(1, 'El período es requerido.'),
});

type EditObservationFormValues = z.infer<typeof formSchema>;

interface EditObservationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  observation: WithId<BehavioralObservation>;
  student: WithId<Student>;
}

export function EditObservationDialog({
  isOpen,
  onOpenChange,
  observation,
  student,
}: EditObservationDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditObservationFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (observation) {
        form.reset({
            description: observation.description,
            period: observation.period,
        });
    }
  }, [observation, form]);

  const onSubmit = async (values: EditObservationFormValues) => {
    setIsLoading(true);
    try {
      const observationRef = doc(firestore, 'students', student.id, 'behavioralObservations', observation.id);
      
      await updateDoc(observationRef, {
        description: values.description,
        period: values.period,
      });

      toast({
        title: '¡Observación Actualizada!',
        description: 'El registro de comportamiento ha sido modificado.',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating observation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la observación. Por favor, inténtelo de nuevo.',
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
          <DialogTitle>Editar Observación</DialogTitle>
          <DialogDescription>
            Modificar el registro de comportamiento para {student.firstName} {student.lastName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un período" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Período 1">Período 1</SelectItem>
                            <SelectItem value="Período 2">Período 2</SelectItem>
                            <SelectItem value="Período 3">Período 3</SelectItem>
                            <SelectItem value="Período 4">Período 4</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la Observación</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describa el comportamiento observado..." {...field} rows={5}/>
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
