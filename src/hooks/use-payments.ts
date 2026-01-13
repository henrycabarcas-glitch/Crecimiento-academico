'use client';

import { useState, useEffect } from 'react';
import { Payment, Student } from '@/lib/types';
import { useStudents } from './use-students';
import { WithId } from '@/firebase';


const initialPaymentsData: WithId<Payment>[] = [
    { id: "PAY001", studentId: "S001", date: "2024-05-01", amount: 150000, method: "Transferencia Bancaria", receiptNumber: "TR-98765", concept: "Pensión Mayo" },
    { id: "PAY002", studentId: "S004", date: "2024-05-02", amount: 150000, method: "Efectivo", receiptNumber: "RC-11223", concept: "Pensión Mayo" },
    { id: "PAY003", studentId: "S001", date: "2024-04-03", amount: 150000, method: "Tarjeta de Crédito", receiptNumber: "TC-45678", concept: "Pensión Abril" },
    { id: "PAY004", studentId: "S007", date: "2024-05-05", amount: 180000, method: "Transferencia Bancaria", receiptNumber: "TR-98799", concept: "Pensión Mayo" },
];

const PAYMENTS_STORAGE_KEY = 'recentPayments';

export function usePayments() {
    const { data: students, isLoading: isLoadingStudents } = useStudents();
    
    const [payments, setPayments] = useState<WithId<Payment>[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedPayments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
                return savedPayments ? JSON.parse(savedPayments) : initialPaymentsData;
            } catch (e) {
                console.error("Failed to parse payments from localStorage", e);
                return initialPaymentsData;
            }
        }
        return initialPaymentsData;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
            } catch (e) {
                 console.error("Failed to save payments to localStorage", e);
            }
        }
    }, [payments]);

    // Effect to clean up payments from deleted students
    useEffect(() => {
        if (!isLoadingStudents && students && payments.length > 0) {
            const studentIds = new Set(students.map(s => s.id));
            const validPayments = payments.filter(p => studentIds.has(p.studentId));

            if (validPayments.length < payments.length) {
                setPayments(validPayments);
            }
        }
    }, [students, isLoadingStudents, payments]);

    const addPayment = (newPaymentData: Omit<Payment, 'id' | 'date' | 'receiptNumber'> & { receiptNumber?: string }) => {
        const newPayment: WithId<Payment> = {
            id: `PAY${String(Date.now()).slice(-4)}`,
            ...newPaymentData,
            date: new Date().toISOString(),
            receiptNumber: newPaymentData.receiptNumber || `TR-${String(Date.now()).slice(-5)}`,
        };
        setPayments(prevPayments => [newPayment, ...prevPayments]);
        return newPayment;
    };

    const getPaymentById = (paymentId: string): WithId<Payment> | undefined => {
        return payments.find(p => p.id === paymentId);
    };

    const paymentsWithStudentData = (selectedStudentId?: string) => {
        if (!students) return [];

        let studentMap: Record<string, any> = {};
        students.forEach(s => studentMap[s.id] = s);

        const paymentsWithData = payments.map(p => ({
            ...p,
            student: studentMap[p.studentId]
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (selectedStudentId) {
            return paymentsWithData.filter(p => p.studentId === selectedStudentId);
        }
        return paymentsWithData;
    };


    return { 
        payments, 
        addPayment,
        getPaymentById,
        paymentsWithStudentData,
        isLoading: isLoadingStudents
    };
}
