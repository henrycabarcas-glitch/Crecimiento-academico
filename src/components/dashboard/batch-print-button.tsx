'use client';

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BatchPrintButton() {

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 @media print:hidden">
            <Button size="lg" className="rounded-full shadow-lg" onClick={handlePrint}>
                <Printer className="mr-2 h-5 w-5" />
                Imprimir Todos
            </Button>
        </div>
    );
}
