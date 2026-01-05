'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAchievementDialog } from '@/components/dashboard/create-achievement-dialog';
import { WithId } from '@/firebase';
import { Course, Achievement } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const coursesData: (Course & { id: string })[] = [
    { id: "C001", name: "Dimensión Comunicativa", gradeLevel: "Transición", teacherId: "T001", description: "Desarrollo del lenguaje oral y escrito.", studentIds: [] },
    { id: "C002", name: "Dimensión Cognitiva", gradeLevel: "Transición", teacherId: "T001", description: "Desarrollo del pensamiento lógico-matemático.", studentIds: [] },
    { id: "C003", name: "Dimensión Corporal", gradeLevel: "Transición", teacherId: "T002", description: "Desarrollo de la motricidad fina y gruesa.", studentIds: [] },
    { id: "C004", name: "Matemáticas 1", gradeLevel: "Primero", teacherId: "T003", description: "Conceptos básicos de matemáticas.", studentIds: [] },
    { id: "C005", name: "Lenguaje 1", gradeLevel: "Primero", teacherId: "T003", description: "Iniciación a la lectura y escritura.", studentIds: [] },
];

const achievementsData: Achievement[] = [
    { id: "ACH001", courseId: "C001", period: "Trimestre 1", description: "Identifica las vocales y su sonido.", gradeLevel: "Transición" },
    { id: "ACH002", courseId: "C002", period: "Trimestre 1", description: "Cuenta objetos hasta el número 20.", gradeLevel: "Transición" },
    { id: "ACH003", courseId: "C003", period: "Trimestre 1", description: "Participa activamente en juegos grupales.", gradeLevel: "Transición" },
    { id: "ACH004", courseId: "C001", period: "Trimestre 2", description: "Escribe su nombre sin ayuda.", gradeLevel: "Transición" },
    { id: "ACH005", courseId: "C004", period: "Trimestre 1", description: "Resuelve sumas de una cifra.", gradeLevel: "Primero" },
];

export default function AchievementsPage() {
    const [courses, setCourses] = useState<WithId<Course>[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
    const [selectedPeriod, setSelectedPeriod] = useState<string>('Trimestre 1');
    const [isCreateAchievementDialogOpen, setCreateAchievementDialogOpen] = useState(false);

    useEffect(() => {
        // Simulate fetching courses
        setCourses(coursesData);
        setIsLoadingCourses(false);
    }, []);

    useEffect(() => {
        // Automatically select the first course when the list loads
        if (!isLoadingCourses && courses && courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, isLoadingCourses, selectedCourseId]);
    
    const selectedCourse = courses?.find(c => c.id === selectedCourseId);

    // Simulate fetching/filtering achievements based on selection
    const filteredAchievements = achievementsData.filter(
        a => a.courseId === selectedCourseId && a.period === selectedPeriod
    );
    
    return (
        <>
            <div className="flex flex-col h-full">
                <PageHeader title="Gestión de Logros e Indicadores" />
                <main className="flex-1 space-y-6 p-4 md:p-6">
                    <Card className="fade-in-up">
                        <CardHeader>
                            <CardTitle>Filtros</CardTitle>
                            <CardDescription>Seleccione un curso y un período para ver y añadir logros.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px] space-y-2">
                                <label className="text-sm font-medium">Curso</label>
                                <Select onValueChange={setSelectedCourseId} value={selectedCourseId} disabled={isLoadingCourses}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingCourses ? "Cargando..." : "Seleccione un curso"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} ({c.gradeLevel})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex-1 min-w-[200px] space-y-2">
                                <label className="text-sm font-medium">Período</label>
                                <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                                        <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                                        <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="self-end">
                                <Button onClick={() => setCreateAchievementDialogOpen(true)} disabled={!selectedCourseId}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Logro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="fade-in-up" style={{ animationDelay: '150ms' }}>
                        <CardHeader>
                            <CardTitle>Logros para {selectedCourse?.name || '...'}</CardTitle>
                             <CardDescription>Período: {selectedPeriod}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descripción del Logro</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingCourses ? (
                                            <TableRow>
                                                <TableCell className="text-center">
                                                     <div className="flex justify-center items-center p-4">
                                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                        <span className="ml-2">Cargando...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : !selectedCourseId ? (
                                            <TableRow>
                                                <TableCell className="text-center text-muted-foreground py-8">
                                                    Por favor, seleccione un curso para ver sus logros.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredAchievements && filteredAchievements.length > 0 ? (
                                            filteredAchievements.map(achievement => (
                                                <TableRow key={achievement.id}>
                                                    <TableCell>{achievement.description}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell className="text-center text-muted-foreground py-8">
                                                    No se encontraron logros para este curso y período. Pruebe a crear uno.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
            {selectedCourse && (
                 <CreateAchievementDialog
                    isOpen={isCreateAchievementDialogOpen}
                    onOpenChange={setCreateAchievementDialogOpen}
                    course={selectedCourse}
                    period={selectedPeriod}
                />
            )}
        </>
    );
}