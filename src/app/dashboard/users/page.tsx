
'use client';
import { useMemo, useState, useEffect } from 'react';
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
import { User, UserRole, Teacher, Parent } from '@/lib/types';
import { DeleteConfirmationDialog } from '@/components/dashboard/delete-confirmation-dialog';
import { doc } from 'firebase/firestore';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { CreateUserForm } from '@/components/dashboard/create-user-form';
import { hasManagementRole } from '@/lib/auth';


const teachersData: Teacher[] = [
    { id: "T001", firstName: "Carmen", lastName: "Diaz", email: "carmen.d@example.com", role: "Profesor" },
    { id: "T002", firstName: "Jorge", lastName: "Perez", email: "jorge.p@example.com", role: "Profesor" },
    { id: "T003", firstName: "Ana", lastName: "Gomez", email: "ana.g@example.com", role: "Director" },
];

const parentsData: Parent[] = [
    { id: "P001", firstName: "Luisa", lastName: "Fernandez", email: "luisa.f@example.com" },
    { id: "P002", firstName: "Carlos", lastName: "Garcia", email: "carlos.g@example.com" },
    { id: "P003", firstName: "Maria", lastName: "Martinez", email: "maria.m@example.com" },
];

export default function UsersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isCreateUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [isDeleteLoading, setDeleteLoading] = useState(false);
  const [hasAdminUser, setHasAdminUser] = useState<boolean | null>(null);

  const users: User[] = useMemo(() => {
    const combinedUsers: User[] = [];
    
    teachersData?.forEach(t => combinedUsers.push({
      ...t,
      role: t.role || 'Profesor',
      sourceCollection: 'teachers'
    }));

    parentsData?.forEach(p => combinedUsers.push({
      ...p,
      role: 'Acudiente',
      sourceCollection: 'parents'
    }));

    return combinedUsers.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, []);
  
  useEffect(() => {
    if (teachersData) {
      const adminExists = teachersData.some(t => hasManagementRole(t.role));
      setHasAdminUser(adminExists);
    }
  }, []);

  const isLoading = hasAdminUser === null;

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
      const userRef = doc(firestore, userToAction.sourceCollection, userToAction.id);
      deleteDocumentNonBlocking(userRef);
      
      toast({
        title: '¡Usuario Eliminado!',
        description: `${userToAction.firstName} ${userToAction.lastName} ha sido eliminado.`,
      });

      setDeleteUserDialogOpen(false);
      setUserToAction(null);
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Gestión de Usuarios y Roles" />
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
                    onUserCreated={() => setHasAdminUser(true)}
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
                    {users.map((user) => {
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
        onOpenChange={setCreateUserDialogOpen}
      />
      {userToAction && (
        <EditUserDialog
          user={userToAction}
          isOpen={isEditUserDialogOpen}
          onOpenChange={setEditUserDialogOpen}
        />
      )}
      {userToAction && (
        <DeleteConfirmationDialog
          isOpen={isDeleteUserDialogOpen}
          onOpenChange={setDeleteUserDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleteLoading}
          title={`¿Eliminar a ${userToAction.firstName}?`}
          description="Esta acción es irreversible y eliminará al usuario del sistema. La cuenta de autenticación no se eliminará."
        />
      )}
    </>
  );
}
