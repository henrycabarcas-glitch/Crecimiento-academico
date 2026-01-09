
'use client';
import { useState, useEffect, useCallback } from 'react';
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
import { useCourses } from '@/hooks/use-courses';
import { useAchievements } from '@/hooks/use-achievements';

export default function AchievementsPage() {
    const { data: courses, isLoading: isLoadingCourses } = useCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
    const [selectedPeriod, setSelectedPeriod] = useState<string>('Trimestre 1');
    const [isCreateAchievementDialogOpen, setCreateAchievementDialogOpen] = useState(false);

    const { data: achievements, isLoading: isLoadingAchievements } = useAchievements(selectedCourseId);

    const handleSetCreateAchievementDialogOpen = useCallback((isOpen: boolean) => {
        setCreateAchievementDialogOpen(isOpen);
    }, []);

    useEffect(() => {
        if (!selectedCourseId && courses && courses.length > 0) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);
    
    const selectedCourse = courses?.find(c => c.id === selectedCourseId);

    const filteredAchievements = achievements?.filter(a => a.period === selectedPeriod);
    const isLoading = isLoadingCourses || (selectedCourseId ? isLoadingAchievements : false);
    
    return (
        <>
            <div className="flex flex-col h-full">
                <PageHeader 
                  title="Gestión de Logros e Indicadores"
                  description="Defina los logros académicos y las competencias para cada curso y período."
                />
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
                                        {isLoading ? (
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
                    onOpenChange={handleSetCreateAchievementDialogOpen}
                    course={selectedCourse}
                    period={selectedPeriod}
                />
            )}
        </>
    );
}
