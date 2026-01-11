'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Loader2, PlusCircle, Trash2, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateUserDialog } from '@/components/dashboard/create-user-dialog';
import { EditUserDialog } from '@/components/dashboard/edit-user-dialog';
import { User, UserRole } from '@/lib/types';
import { DeleteConfirmationDialog } from '@/components/dashboard/delete-confirmation-dialog';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { CreateUserForm } from '@/components/dashboard/create-user-form';
import { hasManagementRole } from '@/lib/auth';
import { useUsers } from '@/hooks/use-users';


export default function UsersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: users, isLoading: isLoadingUsers, teachers } = useUsers();
  
  const [isCreateUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [isDeleteLoading, setDeleteLoading] = useState(false);
  const [hasAdminUser, setHasAdminUser] = useState<boolean | null>(null);

  const handleSetCreateUserDialogOpen = useCallback((isOpen: boolean) => {
    setCreateUserDialogOpen(isOpen);
  }, []);
  
  const handleSetEditUserDialogOpen = useCallback((isOpen: boolean) => {
    setEditUserDialogOpen(isOpen);
    if (!isOpen) {
        setUserToAction(null);
    }
  }, []);

  const handleSetDeleteUserDialogOpen = useCallback((isOpen: boolean) => {
    setDeleteUserDialogOpen(isOpen);
    if (!isOpen) {
        setUserToAction(null);
    }
  }, []);

  const handleUserCreated = useCallback(() => {
    setHasAdminUser(true); // Assume admin exists now
    setCreateUserDialogOpen(false);
  }, []);
  
  useEffect(() => {
    if (!isLoadingUsers && teachers) {
      const adminExists = teachers.some(t => hasManagementRole(t.role));
      setHasAdminUser(adminExists);
    }
  }, [teachers, isLoadingUsers]);

  const isLoading = isLoadingUsers || hasAdminUser === null;

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
        case 'Director':
        case 'Directivo Docente':
        case 'Administrador':
            return 'default';
        case 'Profesor':
            return 'secondary';
        case 'Acudiente':
            return 'outline';
        default:
            return 'secondary';
    }
  }

  const handleEditClick = (user: User) => {
    setUserToAction(user);
    setEditUserDialogOpen(true);
  }

  const handleDeleteClick = (user: User) => {
    setUserToAction(user);
    setDeleteUserDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToAction) return;
    setDeleteLoading(true);

    try {
      // For now, we only delete the Firestore document. 
      // Deleting the Auth user is a sensitive operation and should be handled with care,
      // potentially through a backend function that verifies permissions.
      const userRef = doc(firestore, userToAction.sourceCollection, userToAction.id);
      await deleteDoc(userRef);
      
      toast({
        title: '¡Usuario Eliminado!',
        description: `El registro de ${userToAction.firstName} ${userToAction.lastName} ha sido eliminado de la base de datos. La cuenta de autenticación aún existe.`,
      });

      setDeleteUserDialogOpen(false);
      setUserToAction(null);
    } catch (error: any) {
      console.error("Error deleting user document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo eliminar el registro del usuario. ${error.message}`,
      });
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader 
          title="Gestión de Usuarios y Roles"
          description="Cree nuevos usuarios, asigne roles y administre los permisos de acceso al sistema."
        />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : hasAdminUser === false ? (
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Crear Cuenta de Administrador</CardTitle>
                <CardDescription>
                  No se ha encontrado ninguna cuenta de administrador. Por favor, cree la primera.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateUserForm
                    isInitialAdmin
                    onUserCreated={handleUserCreated}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-end gap-2">
                <Button onClick={() => setCreateUserDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Usuario
                </Button>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => {
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  {user.photoUrl ? (
                                    <AvatarImage src={user.photoUrl} alt={`${user.firstName} ${user.lastName}`} />
                                  ) : (
                                    <AvatarFallback>
                                      <UserIcon className="h-5 w-5" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>{user.email}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Acciones</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleEditClick(user)}>Editar Usuario</DropdownMenuItem>
                                  <DropdownMenuItem>Cambiar Rol</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => handleDeleteClick(user)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </main>
      </div>
       <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        onOpenChange={handleSetCreateUserDialogOpen}
      />
      {userToAction && (
        <EditUserDialog
          user={userToAction}
          isOpen={isEditUserDialogOpen}
          onOpenChange={handleSetEditUserDialogOpen}
        />
      )}
      {userToAction && (
        <DeleteConfirmationDialog
          isOpen={isDeleteUserDialogOpen}
          onOpenChange={handleSetDeleteUserDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleteLoading}
          title={`¿Eliminar a ${userToAction.firstName}?`}
          description="Esta acción es irreversible y eliminará el registro del usuario. La cuenta de autenticación no se verá afectada."
        />
      )}
    </>
  );
}
