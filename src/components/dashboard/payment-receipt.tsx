'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentReceiptProps {
  payment: Payment;
  student: Student;
  schoolSettings: SchoolSettings;
}

export function PaymentReceipt({
  payment,
  student,
  schoolSettings,
}: PaymentReceiptProps) {

  const parent = student.parents?.[0];

  useEffect(() => {
    // Trigger the print dialog once the component is mounted on the client.
    // A small timeout can help ensure all content is rendered before printing.
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white border border-gray-200 shadow-md font-sans">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b-2 border-gray-100">
        <div className="flex items-center gap-4">
          {schoolSettings.logoUrl && (
            <div className="relative w-20 h-20">
              <Image
                src={schoolSettings.logoUrl}
                alt="Logo del Colegio"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{schoolSettings.schoolName}</h1>
            <p className="text-sm text-gray-500">NIT: {schoolSettings.nit}</p>
            <p className="text-sm text-gray-500">Resolución MEN: {schoolSettings.resolutionMEN}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-700">Recibo de Pago</h2>
          <p className="text-sm text-gray-500">No. {payment.receiptNumber}</p>
        </div>
      </header>

      {/* Details */}
      <section className="grid grid-cols-2 gap-8 py-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recibido de</h3>
          <p className="font-medium text-gray-800">{student.firstName} {student.lastName}</p>
          <p className="text-sm text-gray-600">{student.documentType}: {student.documentNumber}</p>
          {parent && <p className="text-sm text-gray-600">Acudiente: {parent.firstName} {parent.lastName}</p>}
        </div>
        <div className="text-right">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalles del Pago</h3>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Fecha:</span> {format(new Date(payment.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Método:</span> {payment.method}
          </p>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-600">Concepto</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700">{payment.concept}</td>
              <td className="p-3 text-gray-700 text-right font-mono">${payment.amount.toLocaleString('es-CO')}</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      {/* Total */}
       <section className="flex justify-end mb-8">
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center py-2">
            <span className="text-md font-semibold text-gray-600">Total Pagado:</span>
            <span className="text-lg font-bold text-gray-800 font-mono">${payment.amount.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500">
        <p>{schoolSettings.address} - Tel: {schoolSettings.phone}</p>
        <p>Gracias por su pago.</p>
      </footer>
    </div>
  );
}
