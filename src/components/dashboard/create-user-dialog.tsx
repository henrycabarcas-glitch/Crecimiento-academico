
'use client';
import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateUserForm } from './create-user-form';


interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CreateUserDialog({
  isOpen,
  onOpenChange,
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserCreated = useCallback(async (createPromise: Promise<any>) => {
    setIsSubmitting(true);
    try {
      await createPromise;
      onOpenChange(false);
    } catch (error) {
      // Error is already handled and toasted in the form
    } finally {
      setIsSubmitting(false);
    }
  }, [onOpenChange]);

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return; // Prevent closing while submitting
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo usuario.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onUserCreated={handleUserCreated} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
