'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { PosReceipt } from '@/components/dashboard/pos-receipt';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { useSchoolSettings } from '@/hooks/use-school-settings';
import { useStudents } from '@/hooks/use-students';


// --- Mock Data ---
// Use the exact same mock data as the billing page for consistency
const paymentsData: (Payment & { id: string })[] = [
    { id: "PAY001", studentId: "S001", date: "2024-05-01", amount: 150000, method: "Transferencia Bancaria", receiptNumber: "TR-98765", concept: "Pensión Mayo" },
    { id: "PAY002", studentId: "S004", date: "2024-05-02", amount: 150000, method: "Efectivo", receiptNumber: "RC-11223", concept: "Pensión Mayo" },
    { id: "PAY003", studentId: "S001", date: "2024-04-03", amount: 150000, method: "Tarjeta de Crédito", receiptNumber: "TC-45678", concept: "Pensión Abril" },
    { id: "PAY004", studentId: "S007", date: "2024-05-05", amount: 180000, method: "Transferencia Bancaria", receiptNumber: "TR-98799", concept: "Pensión Mayo" },
];
// --- End Mock Data ---


type ReceiptData = {
    payment: Payment | null;
    student: Student | null;
    schoolSettings: SchoolSettings | null;
}

export default function PosReceiptPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  
  const { data: schoolSettings, isLoading: isLoadingSettings } = useSchoolSettings();
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  
  const [data, setData] = useState<ReceiptData | null>(null);

  const isLoading = isLoadingSettings || isLoadingStudents;

  useEffect(() => {
    if (isLoading) return;

    // Simulate async operation to find the correct data
    const timer = setTimeout(() => {
        let payment = paymentsData.find(p => p.id === paymentId);
        
        if (!payment) {
             try {
                const recentPayments = JSON.parse(localStorage.getItem('recentPayments') || '[]');
                payment = recentPayments.find((p: Payment) => p.id === paymentId);
            } catch (e) {
                console.error("Could not parse recent payments from localStorage", e);
            }
        }
        
        const student = payment ? students?.find(s => s.id === payment.studentId) : null;

        setData({ 
            payment: payment || null, 
            student: student || null,
            schoolSettings
        });
    }, 50);

    return () => clearTimeout(timer);
  }, [paymentId, schoolSettings, students, isLoading]);

  if (isLoading || !data) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Cargando recibo...</p>
            </div>
        </div>
    );
  }

  if (!data.payment || !data.student || !data.schoolSettings) {
    notFound();
  }

  return (
    <div className="bg-gray-100 flex justify-center py-8">
      <PosReceipt 
        payment={data.payment}
        student={data.student}
        schoolSettings={data.schoolSettings}
      />
    </div>
  );
}
