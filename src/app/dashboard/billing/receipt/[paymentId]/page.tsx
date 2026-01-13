'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { PaymentReceipt } from '@/components/dashboard/payment-receipt';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useSchoolSettings } from '@/hooks/use-school-settings';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';

type ReceiptData = {
    payment: Payment | null;
    student: Student | null;
    schoolSettings: SchoolSettings | null;
}

export default function ReceiptPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  
  const { data: schoolSettings, isLoading: isLoadingSettings } = useSchoolSettings();
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { getPaymentById } = usePayments();
  
  const [data, setData] = useState<ReceiptData | null>(null);
  
  const isLoading = isLoadingSettings || isLoadingStudents;

  useEffect(() => {
    if (isLoading) return;

    const payment = getPaymentById(paymentId);
    const student = payment ? students?.find(s => s.id === payment.studentId) : null;

    setData({ 
        payment: payment || null, 
        student: student || null, 
        schoolSettings
    });

  }, [paymentId, schoolSettings, students, isLoading, getPaymentById]);

  if (isLoading || !data) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Cargando información del recibo...</p>
            </div>
        </div>
    );
  }

  if (!data.payment || !data.student) {
    notFound();
  }
  
  if (!data.schoolSettings) {
       return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Cargando información del colegio...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="bg-white">
      <PaymentReceipt 
        payment={data.payment}
        student={data.student}
        schoolSettings={data.schoolSettings}
      />
    </div>
  );
}
