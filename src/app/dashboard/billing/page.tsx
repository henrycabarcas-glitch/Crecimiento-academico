'use client';
import { useState, useMemo } from "react";
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
import { Loader2, DollarSign, Printer } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Student, Payment } from "@/lib/types";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const paymentSchema = z.object({
    studentId: z.string().min(1, { message: "Debe seleccionar un estudiante." }),
    concept: z.string().min(1, { message: "El concepto es requerido." }),
    amount: z.coerce.number().min(1, { message: "El monto debe ser mayor a 0." }),
    method: z.string().min(1, { message: "Debe seleccionar un método de pago." }),
    receiptNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const studentsData: Student[] = [
    { id: "S001", firstName: "Sofía", lastName: "Rodriguez", gradeLevel: "Jardín", parentIds: [], enrollmentDate: '' , documentNumber: '1011121314', documentType: 'Registro Civil', dateOfBirth: '', gender: ''},
    { id: "S002", firstName: "Mateo", lastName: "Garcia", gradeLevel: "Jardín", parentIds: [], enrollmentDate: '' , documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S003", firstName: "Valentina", lastName: "Martinez", gradeLevel: "Transición", parentIds: [], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: '' },
    { id: "S004", firstName: "Santiago", lastName: "Lopez", gradeLevel: "Transición", parentIds: ["P004"], parents: [{id: 'P004', firstName: "Juan", lastName: "Lopez", email: "juan.l@example.com"}], enrollmentDate: '', documentNumber: '1015161718', documentType: 'Registro Civil', dateOfBirth: '', gender: '' },
    { id: "S005", firstName: "Isabella", lastName: "Gonzalez", gradeLevel: "Pre-jardín", parentIds: [], enrollmentDate: '', documentNumber: '', documentType: '', dateOfBirth: '', gender: ''},
    { id: "S007", firstName: "Camila", lastName: "Perez", gradeLevel: "Primero", parentIds: [], enrollmentDate: '' , documentNumber: '1019202122', documentType: 'Tarjeta de Identidad', dateOfBirth: '', gender: ''},
];

const initialPaymentsData: Payment[] = [
    { id: "PAY001", studentId: "S001", date: "2024-05-01", amount: 150000, method: "Transferencia Bancaria", receiptNumber: "TR-98765", concept: "Pensión Mayo" },
    { id: "PAY002", studentId: "S004", date: "2024-05-02", amount: 150000, method: "Efectivo", receiptNumber: "RC-11223", concept: "Pensión Mayo" },
    { id: "PAY003", studentId: "S001", date: "2024-04-03", amount: 150000, method: "Tarjeta de Crédito", receiptNumber: "TC-45678", concept: "Pensión Abril" },
    { id: "PAY004", studentId: "S007", date: "2024-05-05", amount: 180000, method: "Transferencia Bancaria", receiptNumber: "TR-98799", concept: "Pensión Mayo" },
];


export default function BillingPage() {
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(initialPaymentsData);
  
  const isLoadingStudents = false;
  const students = studentsData;

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
    let studentMap: Record<string, Student> = {};
    students.forEach(s => studentMap[s.id] = s);

    const paymentsWithStudentData = payments.map(p => ({
        ...p,
        student: studentMap[p.studentId]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (selectedStudentId) {
        return paymentsWithStudentData.filter(p => p.studentId === selectedStudentId);
    }
    return paymentsWithStudentData;
  }, [selectedStudentId, payments, students]);

  const getStudentAvatar = (student?: Student) => {
    if (!student) return { imageUrl: '', imageHint: '' };
    const studentImageId = `student-${student.id.slice(-1)}`;
    const image = PlaceHolderImages.find(img => img.id === studentImageId);
    return image || { imageUrl: '', imageHint: '' };
  };
  
  const { imageUrl, imageHint } = getStudentAvatar(selectedStudent);

  function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
        const newPayment: Payment = {
            id: `PAY${String(Date.now()).slice(-4)}`,
            studentId: data.studentId,
            date: new Date().toISOString().split('T')[0],
            amount: data.amount,
            method: data.method,
            concept: data.concept,
            receiptNumber: data.receiptNumber || `TR-${String(Date.now()).slice(-5)}`,
        };

        setPayments(prevPayments => [...prevPayments, newPayment]);

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

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full">
      <PageHeader title="Gestión de Tarifas y Facturación" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
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
                            <AvatarImage src={imageUrl} alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`} data-ai-hint={imageHint}/>
                            <AvatarFallback>{selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}</AvatarFallback>
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
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button asChild variant="ghost" size="icon">
                                                        <Link href={`/dashboard/billing/receipt/${payment.id}`} target="_blank">
                                                            <Printer className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Imprimir Recibo</p>
                                                </TooltipContent>
                                            </Tooltip>
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
      </main>
    </div>
    </TooltipProvider>
  );
}
