'use client';

import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ParentDashboardPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        router.replace('/dashboard');
        return null;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Portal de Acudientes</h1>
            <p className="text-muted-foreground">¡Bienvenido, {user.displayName || user.email}!</p>

            <div className="mt-8">
                <h2 className="text-xl font-semibold">Mis Estudiantes</h2>
                <p className="mt-4">Aquí se mostrará la información de sus hijos.</p>
                {/* Future implementation will list children here */}
            </div>
        </div>
    );
}
