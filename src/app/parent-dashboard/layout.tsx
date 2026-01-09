'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import { SchoolSettings } from "@/lib/types";
import { useSchoolSettings } from "@/hooks/use-school-settings";
import { signOut } from "firebase/auth";
import { GraduationCap, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { data: schoolSettings, isLoading: isSettingsLoading } = useSchoolSettings();

  const handleSignOut = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/dashboard');
    }
  };

  if (isUserLoading || isSettingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
             <Link href="/parent-dashboard" className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground p-1">
                    {schoolSettings?.logoUrl ? (
                        <Image src={schoolSettings.logoUrl} alt="Logo" width={36} height={36} className="object-contain" />
                    ) : (
                        <GraduationCap className="size-6" />
                    )}
                </div>
                <h1 className="text-xl font-semibold text-gray-800">
                    {schoolSettings?.schoolName || "Scholarly Growth"}
                </h1>
            </Link>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Avatar>
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Cerrar Sesión
                </Button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
    </div>
  );
}
