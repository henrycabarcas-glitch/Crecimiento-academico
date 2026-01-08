'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Student, Payment, SchoolSettings } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PosReceiptProps {
  payment: Payment;
  student: Student;
  schoolSettings: SchoolSettings;
}

export function PosReceipt({
  payment,
  student,
  schoolSettings,
}: PosReceiptProps) {

  useEffect(() => {
    // Trigger the print dialog once the component is mounted on the client.
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-[80mm] p-2 bg-white text-black font-mono text-xs">
        <style jsx global>{`
            @media print {
                @page {
                    size: 80mm auto;
                    margin: 2mm;
                }
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
      `}</style>
      {/* Header */}
      <header className="text-center mb-2">
        {schoolSettings.logoUrl && (
          <div className="relative w-16 h-16 mx-auto mb-1">
            <Image
              src={schoolSettings.logoUrl}
              alt="Logo del Colegio"
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
        <h1 className="font-bold text-sm uppercase">{schoolSettings.schoolName}</h1>
        <p>NIT: {schoolSettings.nit}</p>
        <p>{schoolSettings.address}</p>
        <p>Tel: {schoolSettings.phone}</p>
      </header>

      <div className="border-t border-b border-dashed border-black my-2 py-1">
        <h2 className="text-center font-bold uppercase">Recibo de Pago</h2>
      </div>

      {/* Details */}
      <section className="mb-2 space-y-1">
         <p><strong>Recibo No:</strong> {payment.receiptNumber}</p>
         <p><strong>Fecha:</strong> {format(new Date(payment.date), "dd/MM/yyyy HH:mm", { locale: es })}</p>
         <p><strong>Estudiante:</strong> {student.firstName} {student.lastName}</p>
         <p><strong>Documento:</strong> {student.documentNumber}</p>
      </section>

      {/* Items Table */}
      <section className="mb-2">
        <table className="w-full">
          <thead className="border-t border-b border-dashed border-black">
            <tr>
              <th className="py-1 text-left">Concepto</th>
              <th className="py-1 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="border-b border-dashed border-black">
            <tr>
              <td className="py-1">{payment.concept}</td>
              <td className="py-1 text-right">${payment.amount.toLocaleString('es-CO')}</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      {/* Total */}
       <section className="text-right font-bold mb-2">
            <p>TOTAL PAGADO: ${payment.amount.toLocaleString('es-CO')}</p>
      </section>
      
       <section className="text-left text-xs mb-2">
            <p><strong>Método de Pago:</strong> {payment.method}</p>
       </section>


      {/* Footer */}
      <footer className="text-center mt-2">
        <p>¡Gracias por su pago!</p>
        <p>***</p>
      </footer>
    </div>
  );
}
