'use client';

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { useUser } from "@/firebase/provider";
import { hasManagementRole } from "@/lib/auth";
import { Teacher } from "@/lib/types";

const formSchema = z.object({
  schoolName: z.string().min(1, 'El nombre es requerido.'),
  rectorName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  nit: z.string().optional(),
  resolutionMEN: z.string().optional(),
  daneCode: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

const SETTINGS_DOC_ID = "main";

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "Colegio Crecimiento Académico",
      rectorName: "",
      phone: "",
      address: "",
      email: "",
      logoUrl: "",
      nit: "",
      resolutionMEN: "",
      daneCode: "",
    },
  });
  
  const logoUrl = form.watch("logoUrl");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function checkPermissionsAndFetch() {
        if (isUserLoading || !firestore || !user) {
            setIsFetching(true);
            return;
        }

        setIsFetching(true);
        let userCanEdit = false;

        if (user.isAnonymous) {
            // Allow anonymous for dev purposes based on previous logic
            userCanEdit = true;
        } else {
            // Fetch the user's document from 'teachers' to check their role
            const teacherRef = doc(firestore, "teachers", user.uid);
            try {
                const docSnap = await getDoc(teacherRef);
                if (docSnap.exists()) {
                    const teacherData = docSnap.data() as Teacher;
                    userCanEdit = hasManagementRole(teacherData.role);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        }
        
        setCanEdit(userCanEdit);

        if (userCanEdit) {
            try {
                const settingsRef = doc(firestore, "settings", SETTINGS_DOC_ID);
                const docSnap = await getDoc(settingsRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Ensure all fields have a default value to prevent uncontrolled to controlled error
                    form.reset({
                        schoolName: data.schoolName || "Colegio Crecimiento Académico",
                        rectorName: data.rectorName || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        email: data.email || "",
                        logoUrl: data.logoUrl || "",
                        nit: data.nit || "",
                        resolutionMEN: data.resolutionMEN || "",
                        daneCode: data.daneCode || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        }
        
        setIsFetching(false);
    }
    
    checkPermissionsAndFetch();

  }, [firestore, user, isUserLoading, form]);


  const onSubmit = async (values: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const settingsRef = doc(firestore, "settings", SETTINGS_DOC_ID);
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: "¡Configuración Guardada!",
        description: "La información del colegio ha sido actualizada.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
      return (
        <div className="flex flex-col h-full">
            <PageHeader title="Configuración del Colegio" />
            <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Configuración Institucional"
        description="Gestione la información clave y la identidad visual de su institución."
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Información del Colegio</CardTitle>
                  <CardDescription>
                    Actualice los datos principales de la institución educativa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isFetching ? (
                     <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                  ) : !canEdit ? (
                     <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/50 rounded-lg p-4">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                        <h3 className="mt-4 text-lg font-semibold">Acceso Denegado</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            No tiene los permisos necesarios para editar la configuración.
                        </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 text-center">
                        <div className="mx-auto w-32 h-32 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                          {logoUrl && logoUrl.startsWith('data:image') ? (
                            <Image
                              src={logoUrl}
                              alt="Logo del colegio"
                              width={128}
                              height={128}
                              className="object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                         <FormField
                            control={form.control}
                            name="logoUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo del Colegio</FormLabel>
                                <FormControl>
                                  <div>
                                    <Input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      ref={fileInputRef} 
                                      onChange={handleLogoChange}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      Subir Logo
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Colegio</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Colegio Crecimiento Académico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                          control={form.control}
                          name="nit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIT</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 900.123.456-7" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="resolutionMEN"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resolución MEN</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Res. 1234 de 2023" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="daneCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registro DANE</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 123456789012" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="rectorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Rector/a</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Carmen Diaz" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: +57 300 123 4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Calle 123 #45-67, Bogotá" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Ej: contacto@crecimientoacademico.edu.co" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading || isFetching || !canEdit}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  );
}
