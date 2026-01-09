'use client';
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo usuario.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
