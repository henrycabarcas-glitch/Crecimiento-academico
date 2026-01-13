'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { PosReceipt } from '@/components/dashboard/pos-receipt';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { useSchoolSettings } from '@/hooks/use-school-settings';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';

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
