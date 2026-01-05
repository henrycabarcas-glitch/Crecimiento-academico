'use server';

import { notFound } from 'next/navigation';
import { PaymentReceipt } from '@/components/dashboard/payment-receipt';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { getFirestore, getDoc } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/firebase/server';

// --- Mock Data (for payments and students, school settings will be fetched) ---
const studentsData: Student[] = [
    { id: "S001", firstName: "Sofía", lastName: "Rodriguez", gradeLevel: "Jardín", parentIds: ["P001"], parents: [{id: 'P001', firstName: "Luisa", lastName: "Fernandez", email: "luisa.f@example.com"}], enrollmentDate: '', documentNumber: '1011121314', documentType: 'Registro Civil', dateOfBirth: '', gender: ''},
    { id: "S004", firstName: "Santiago", lastName: "Lopez", gradeLevel: "Transición", parentIds: ["P004"], parents: [{id: 'P004', firstName: "Juan", lastName: "Lopez", email: "juan.l@example.com"}], enrollmentDate: '', documentNumber: '1015161718', documentType: 'Registro Civil', dateOfBirth: '', gender: '' },
    { id: "S007", firstName: "Camila", lastName: "Perez", gradeLevel: "Primero", parentIds: [], enrollmentDate: '' , documentNumber: '1019202122', documentType: 'Tarjeta de Identidad', dateOfBirth: '', gender: ''},
];

const paymentsData: Payment[] = [
    { id: "PAY001", studentId: "S001", date: "2024-05-01", amount: 150000, method: "Transferencia Bancaria", receiptNumber: "TR-98765", concept: "Pensión Mayo" },
    { id: "PAY002", studentId: "S004", date: "2024-05-02", amount: 150000, method: "Efectivo", receiptNumber: "RC-11223", concept: "Pensión Mayo" },
    { id: "PAY003", studentId: "S001", date: "2024-04-03", amount: 150000, method: "Tarjeta de Crédito", receiptNumber: "TC-45678", concept: "Pensión Abril" },
    { id: "PAY004", studentId: "S007", date: "2024-05-05", amount: 180000, method: "Transferencia Bancaria", receiptNumber: "TR-98799", concept: "Pensión Mayo" },
];
// --- End Mock Data ---


// Fetch data on the server
async function getReceiptData(paymentId: string) {
    try {
        const app = getFirebaseAdminApp();
        const firestore = getFirestore(app);

        const payment = paymentsData.find(p => p.id === paymentId);
        const student = payment ? studentsData.find(s => s.id === payment.studentId) : undefined;
        
        const settingsRef = firestore.doc("settings/main");
        const settingsSnap = await getDoc(settingsRef);
        
        let schoolSettings: SchoolSettings | null = null;
        if (settingsSnap.exists()) {
            schoolSettings = settingsSnap.data() as SchoolSettings;
        }

        return { payment, student, schoolSettings };

    } catch (error) {
        console.error("Error fetching receipt data:", error);
        return { payment: null, student: null, schoolSettings: null };
    }
}


export default async function ReceiptPage({ params }: { params: { paymentId: string } }) {
  
  const { payment, student, schoolSettings } = await getReceiptData(params.paymentId);

  if (!payment || !student) {
    notFound();
  }

  if (!schoolSettings) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Cargando información del colegio...</p>
                <p className="text-sm text-muted-foreground/80">Si este mensaje persiste, configure los datos del colegio en el panel de administración.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="bg-white">
      <PaymentReceipt 
        payment={payment}
        student={student}
        schoolSettings={schoolSettings}
      />
    </div>
  );
}
