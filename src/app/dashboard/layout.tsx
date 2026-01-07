'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Loader2, Home } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase/provider";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;


const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

function MushroomIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        >
            <path d="M12 2c-3.31 0-6 2.69-6 6v1h12V8c0-3.31-2.69-6-6-6zm-3.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="#E57373"/>
            <path d="M6 10h12v10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V10z" fill="#F0F4C3"/>
            <circle cx="12" cy="5.5" r="1.5" fill="#FFFFFF"/>
        </svg>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
          email: '',
          password: '',
      },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
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
        setIsLoading(false);
    }
  };


  // Automatically sign in anonymously if no user is detected after loading.
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      // This is disabled now to allow for manual login.
      initiateAnonymousSignIn(auth); 
    }
  }, [isUserLoading, user, auth]);

  if (isUserLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center bg-blue-100">
             <Card className="w-full max-w-sm">
                 <form onSubmit={form.handleSubmit(handleLogin)}>
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-500 text-white">
                                <MushroomIcon className="size-7" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-blue-900 font-bold">Aldea Pitufa</CardTitle>
                        <CardDescription>¡Pitufea tus datos para entrar!</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Pitufo-Email</Label>
                            <Input id="email" type="email" placeholder="papa.pitufo@aldea.com" required {...form.register('email')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña Pitufa</Label>
                            <Input id="password" type="password" required {...form.register('password')}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ¡Pitufar!
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-3 p-2 -ml-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <MushroomIcon className="size-6" />
            </div>
            <h1 className="text-lg font-semibold font-headline tracking-tight text-sidebar-primary">
              Aldea Pitufa
            </h1>
          </Link>
        </SidebarHeader>
        
        <SidebarNav />

        <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-9 w-9">
                <AvatarImage 
                  src={user.photoURL || userAvatar?.imageUrl} 
                  alt={user.displayName || "User avatar"} 
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user.displayName || (user.isAnonymous ? 'Usuario Anónimo' : (user.email || 'Usuario'))}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email ? user.email : user.uid}</span>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
