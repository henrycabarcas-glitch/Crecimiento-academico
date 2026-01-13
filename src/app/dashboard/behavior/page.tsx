
'use client';
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Loader2, MoreVertical, Trash2, Edit } from "lucide-react";
import { BehavioralObservation, Student, WithId } from "@/lib/types";
import { useStudents } from "@/hooks/use-students";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useUser } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { EditObservationDialog } from "@/components/dashboard/edit-observation-dialog";


export default function BehaviorPage() {
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [observationText, setObservationText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Período 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const firestore = useFirestore();

  const [observationToAction, setObservationToAction] = useState<WithId<BehavioralObservation> | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);


  const student = students?.find(s => s.id === selectedStudentId);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedStudentId) return null;
    return query(
        collection(firestore, 'students', selectedStudentId, 'behavioralObservations'), 
        orderBy('date', 'desc')
    );
  }, [firestore, selectedStudentId]);

  const { data: logs, isLoading: isLoadingLogs } = useCollection<BehavioralObservation>(logsQuery);

  const handleAddObservation = async () => {
    if (!selectedStudentId || !observationText || !user || !selectedPeriod) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, seleccione un estudiante, un período y escriba una observación.",
        });
        return;
    }

    setIsSubmitting(true);
    try {
        const observationRef = collection(firestore, 'students', selectedStudentId, 'behavioralObservations');
        await addDoc(observationRef, {
            studentId: selectedStudentId,
            description: observationText,
            date: new Date().toISOString(),
            teacherId: user.uid,
            period: selectedPeriod,
        });

        toast({
            title: "Registro Añadido",
            description: "La observación ha sido guardada exitosamente.",
        });

        setObservationText("");
    } catch (error) {
        console.error("Error adding observation: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo guardar la observación.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleEditClick = (log: WithId<BehavioralObservation>) => {
    setObservationToAction(log);
    setIsEditOpen(true);
  };
  
  const handleDeleteClick = (log: WithId<BehavioralObservation>) => {
    setObservationToAction(log);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!observationToAction || !selectedStudentId) return;
    setIsDeleteLoading(true);
    try {
        const logRef = doc(firestore, 'students', selectedStudentId, 'behavioralObservations', observationToAction.id);
        await deleteDoc(logRef);
        toast({ title: "Observación Eliminada", description: "El registro ha sido eliminado."});
        setIsDeleteOpen(false);
        setObservationToAction(null);
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la observación."});
    } finally {
        setIsDeleteLoading(false);
    }
  };


  const getStudentAvatar = (studentId?: string) => {
    if (!studentId) return { imageUrl: '', imageHint: '' };
    return { imageUrl: student?.photoUrl || '', imageHint: 'student portrait' };
  };

  const { imageUrl, imageHint } = getStudentAvatar(student?.id);
  const isLoading = isLoadingStudents || (selectedStudentId ? isLoadingLogs : false);


  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader 
          title="Registro de Comportamiento"
          description="Anote y consulte el historial de observaciones de comportamiento de los estudiantes."
        />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Observación</CardTitle>
                  <CardDescription>
                    Registre una nueva observación de comportamiento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="student-select" className="text-sm font-medium">Estudiante</label>
                    <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={isLoadingStudents}>
                      <SelectTrigger id="student-select">
                        <SelectValue placeholder={isLoadingStudents ? "Cargando..." : "Seleccione un estudiante"} />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="period-select" className="text-sm font-medium">Período</label>
                    <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
                        <SelectTrigger id="period-select">
                            <SelectValue placeholder="Seleccione un período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Período 1">Período 1</SelectItem>
                            <SelectItem value="Período 2">Período 2</SelectItem>
                            <SelectItem value="Período 3">Período 3</SelectItem>
                            <SelectItem value="Período 4">Período 4</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                      <label htmlFor="observation-text" className="text-sm font-medium">Observación</label>
                      <Textarea 
                          id="observation-text" 
                          placeholder="Describa el comportamiento..."
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          disabled={isSubmitting}
                      />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddObservation} disabled={isSubmitting || !selectedStudentId}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    Añadir Registro
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                      {student && (
                          <Avatar className="h-12 w-12">
                              <AvatarImage src={imageUrl || undefined} alt={`${student.firstName} ${student.lastName}`} data-ai-hint={imageHint}/>
                              <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                          </Avatar>
                      )}
                      <div>
                          <CardTitle>Historial de Observaciones de</CardTitle>
                          <CardDescription className="text-lg font-semibold text-foreground">
                              {student ? `${student.firstName} ${student.lastName}` : 'Seleccione un estudiante'}
                          </CardDescription>
                      </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                          Cargando...
                      </div>
                    ) : logs && logs.length > 0 ? logs.map((log) => (
                      <div key={log.id} className="flex gap-4 group">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-secondary flex flex-col items-center justify-center">
                              <span className="text-sm font-bold">{new Date(log.date).getDate()}</span>
                              <span className="text-xs">{new Date(log.date).toLocaleString('es-ES', { month: 'short' })}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-foreground">{log.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.period} - Observado por: {log.teacherId} {/* Replace with teacher name later */}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleEditClick(log)}>
                                        <Edit className="mr-2 h-4 w-4"/>
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDeleteClick(log)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                          {student ? 'No se encontraron observaciones para este estudiante.' : 'Seleccione un estudiante para ver su historial.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      {observationToAction && student && (
        <EditObservationDialog 
            isOpen={isEditOpen} 
            onOpenChange={setIsEditOpen} 
            observation={observationToAction} 
            student={student} 
        />
      )}
      {observationToAction && (
          <DeleteConfirmationDialog 
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDeleteConfirm}
            isLoading={isDeleteLoading}
            title="¿Eliminar Observación?"
            description="Esta acción es irreversible y eliminará permanentemente el registro de comportamiento."
          />
      )}
    </>
  );
}
