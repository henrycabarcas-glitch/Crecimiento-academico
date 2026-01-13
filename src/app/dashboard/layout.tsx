
'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Loader2, Mail, Lock, ShieldAlert } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { SchoolSettings, Teacher } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { useSchoolSettings } from "@/hooks/use-school-settings";
import { useFirestore } from "@/firebase";


const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;


function DashboardView({ children, schoolSettings }: { children: React.ReactNode, schoolSettings: SchoolSettings | null }) {
    const { user } = useUser();
    
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                <Link href="/dashboard" className="flex items-center gap-3 p-2 -ml-2">
                    <div className="flex items-center justify-center size-10 bg-sidebar-primary text-sidebar-primary-foreground p-1">
                    {schoolSettings?.logoUrl ? (
                        <Image src={schoolSettings.logoUrl} alt="Logo" width={36} height={36} className="object-contain" />
                    ) : (
                        <GraduationCap className="size-6" />
                    )}
                    </div>
                    <h1 className="text-lg font-semibold font-headline tracking-tight text-sidebar-primary">
                    {schoolSettings?.schoolName || "Scholarly Growth"}
                    </h1>
                </Link>
                </SidebarHeader>
                
                <SidebarNav />

                <SidebarFooter>
                    <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage 
                        src={user!.photoURL || undefined} 
                        alt={user!.displayName || "User avatar"} 
                        />
                        <AvatarFallback>{user!.displayName?.charAt(0) || user!.email?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user!.displayName || (user!.isAnonymous ? 'Usuario Anónimo' : (user!.email || 'Usuario'))}</span>
                        <span className="text-xs text-muted-foreground truncate">{user!.email ? user!.email : user!.uid}</span>
                    </div>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

function LoginView({ schoolSettings }: { schoolSettings: SchoolSettings | null }) {
    const { toast } = useToast();
    const auth = useAuth();
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleLogin = async (values: LoginFormValues) => {
        setIsLoginLoading(true);
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            toast({
                title: "¡Bienvenido!",
                description: "Has iniciado sesión correctamente.",
            });
        } catch (error: any) {
            console.error('Login error:', error);
            let description = "Credenciales incorrectas. Por favor, inténtelo de nuevo.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                description = "El correo electrónico o la contraseña que ingresaste son incorrectos.";
            }
            toast({
                variant: "destructive",
                title: "Error de Inicio de Sesión",
                description: description,
            });
        } finally {
            setIsLoginLoading(false);
        }
    };
    
    return (
        <div className="flex min-h-screen w-full bg-background">
             <div 
                className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
            >
                <div className="relative z-10 flex flex-col justify-end p-16 text-white bg-gradient-to-t from-primary/80 to-transparent w-full h-full">
                    <h1 className="text-5xl font-bold mb-4">Crecimiento Académico</h1>
                    <p className="text-xl opacity-90 font-medium">Una plataforma para la gestión educativa del mañana.</p>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
                 <div className="w-full max-w-md bg-card p-8 sm:p-10 rounded-2xl shadow-xl shadow-blue-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 mb-4">
                           {schoolSettings?.logoUrl ? (
                                <Image src={schoolSettings.logoUrl} alt="Logo" width={96} height={96} className="object-contain" />
                            ) : (
                                <GraduationCap className="text-primary h-24 w-24" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-card-foreground mb-1">{schoolSettings?.schoolName || "Scholarly Growth"}</h2>
                        <p className="text-muted-foreground font-medium text-center">¡Bienvenido! Ingrese sus credenciales.</p>
                    </div>
                     <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                        <div>
                            <Label className="block text-sm font-semibold text-foreground/80 mb-2 px-1" htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input 
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:placeholder-slate-500 h-auto" 
                                  id="email" 
                                  type="email" 
                                  placeholder="usuario@ejemplo.com"
                                  required 
                                  {...form.register('email')}
                                 />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <Label className="text-sm font-semibold text-foreground/80" htmlFor="password">Contraseña</Label>
                                <a className="text-xs font-bold text-primary hover:underline" href="#">¿Olvidaste tu contraseña?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input 
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:placeholder-slate-500 h-auto" 
                                  id="password" 
                                  type="password" 
                                  placeholder="••••••••" 
                                  required 
                                  {...form.register('password')}
                                />
                            </div>
                        </div>
                        
                        <Button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 h-auto" type="submit" disabled={isLoginLoading}>
                            {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ingresar
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function LayoutRenderer({ children, user }: { children: React.ReactNode, user: User | null }) {
    const { data: schoolSettings, isLoading: isSettingsLoading } = useSchoolSettings();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const firestore = useFirestore();
    const auth = useAuth();
    
    useEffect(() => {
        const checkUserRole = async (user: User) => {
            if (!firestore) return;
            setIsCheckingRole(true);
            const teacherRef = doc(firestore, "teachers", user.uid);
            try {
                const docSnap = await getDoc(teacherRef);
                if (docSnap.exists()) {
                    // User is in the teachers collection, they are authorized.
                    setIsAuthorized(true);
                } else {
                    // User is not a teacher/staff, deny access and sign out.
                    setIsAuthorized(false);
                    await auth.signOut();
                }
            } catch (error) {
                console.error("Error checking user role:", error);
                setIsAuthorized(false);
                 await auth.signOut();
            } finally {
                setIsCheckingRole(false);
            }
        };
        
        if (user && !user.isAnonymous) {
            checkUserRole(user);
        } else {
            // No user or anonymous user, not authorized for dashboard
            setIsAuthorized(false);
            setIsCheckingRole(false);
        }
    }, [user, firestore, auth]);

    const isLoading = isSettingsLoading || (user && !user.isAnonymous && isCheckingRole);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAuthorized) {
        return <LoginView schoolSettings={schoolSettings} />;
    }

    return <DashboardView schoolSettings={schoolSettings}>{children}</DashboardView>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return <LayoutRenderer user={user}>{children}</LayoutRenderer>;
}
