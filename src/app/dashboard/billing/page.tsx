'use client';
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, DollarSign, Printer, MoreVertical, User, ShieldAlert } from "lucide-react";
import { Student, Payment, Teacher } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStudents } from "@/hooks/use-students";
import { useUser } from "@/firebase";
import { useTeachers } from "@/hooks/use-teachers";
import { hasManagementRole } from "@/lib/auth";
import { usePayments } from "@/hooks/use-payments";


const paymentSchema = z.object({
    studentId: z.string().min(1, { message: "Debe seleccionar un estudiante." }),
    concept: z.string().min(1, { message: "El concepto es requerido." }),
    amount: z.coerce.number().min(1, { message: "El monto debe ser mayor a 0." }),
    method: z.string().min(1, { message: "Debe seleccionar un método de pago." }),
    receiptNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function BillingPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { data: teachers, isLoading: isLoadingTeachers } = useTeachers();
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { addPayment, paymentsWithStudentData } = usePayments();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useMemo(() => {
    if (!user || !teachers) return null;
    return teachers.find(t => t.id === user.uid);
  }, [user, teachers]);

  const canManageBilling = useMemo(() => {
    if (!currentUser) return false;
    return hasManagementRole(currentUser.role);
  }, [currentUser]);
  

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: "",
      concept: "",
      amount: 0,
      method: "",
      receiptNumber: "",
    },
  });

  const selectedStudent = students?.find(s => s.id === selectedStudentId);

  const paymentHistory = useMemo(() => {
    return paymentsWithStudentData(selectedStudentId);
  }, [selectedStudentId, paymentsWithStudentData]);
  
  function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
        addPayment(data);

        toast({
            title: "Pago Registrado",
            description: `Se registró un pago de $${data.amount.toLocaleString('es-CO')} para el concepto "${data.concept}".`,
        });
        
        form.reset({
            studentId: data.studentId, // Keep student selected
            concept: "",
            amount: 0,
            method: "",
            receiptNumber: "",
        });

        setIsSubmitting(false);
    }, 1000);
  }

  if (isLoadingStudents || isLoadingTeachers) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Gestión de Facturación y Pagos"
        description="Registre pagos, consulte historiales y genere recibos para los estudiantes."
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {!canManageBilling ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-muted/50 rounded-lg p-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-xl font-semibold">Acceso Denegado</h3>
                <p className="mt-2 text-md text-muted-foreground">
                    No tiene los permisos necesarios para gestionar la facturación.
                </p>
            </div>
        ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card className="fade-in-up">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle>Registrar Pago</CardTitle>
                                <CardDescription>
                                Seleccione un estudiante y complete los detalles del pago.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="studentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estudiante</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); setSelectedStudentId(value); }} value={field.value} disabled={isLoadingStudents}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingStudents ? "Cargando..." : "Seleccione un estudiante"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {students?.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                    {s.firstName} {s.lastName}
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="concept"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Concepto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: Pensión Mayo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Método de Pago</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un método" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                                                    <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
                                                    <SelectItem value="PSE">PSE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="receiptNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Recibo (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: TR-12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrar Pago
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="fade-in-up" style={{ animationDelay: '150ms' }}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                        {selectedStudent && (
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedStudent.photoUrl || undefined} alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`} />
                                <AvatarFallback>
                                    {selectedStudent.photoUrl ? null : <User className="h-6 w-6" />}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <CardTitle>Historial de Pagos</CardTitle>
                            <CardDescription className="text-lg font-semibold text-foreground">
                                {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Todos los Estudiantes'}
                            </CardDescription>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    {!selectedStudentId && <TableHead>Estudiante</TableHead>}
                                    <TableHead>Concepto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingStudents ? (
                                    <TableRow>
                                        <TableCell colSpan={selectedStudentId ? 5 : 6} className="h-24 text-center">Cargando...</TableCell>
                                    </TableRow>
                                ) : paymentHistory.length > 0 ? (
                                    paymentHistory.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{new Date(payment.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                            {!selectedStudentId && (
                                                <TableCell>
                                                    {payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'N/A'}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className="font-medium">{payment.concept}</div>
                                                <div className="text-sm text-muted-foreground">Recibo: {payment.receiptNumber}</div>
                                            </TableCell>
                                            <TableCell>{payment.method}</TableCell>
                                            <TableCell className="text-right font-mono">${payment.amount.toLocaleString('es-CO')}</TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Imprimir</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/billing/receipt/${payment.id}`} target="_blank">Recibo (Carta)</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/billing/pos-receipt/${payment.id}`} target="_blank">Recibo (POS)</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={selectedStudentId ? 5 : 6} className="h-24 text-center">
                                            {selectedStudent ? "No se encontraron pagos para este estudiante." : "No se han registrado pagos."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        )}
      </main>
    </div>
  );
}
