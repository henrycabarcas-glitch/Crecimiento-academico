'use client';
import { useState, useEffect, useMemo } from "react";
import { Activity, ArrowUpRight, Users, CalendarCheck, LayoutDashboard, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useStudents } from "@/hooks/use-students";

const performanceData = [
    { subject: 'Lenguaje', 'Superior': 40, 'Alto': 24, 'Básico': 18 },
    { subject: 'Matemáticas', 'Superior': 30, 'Alto': 13, 'Básico': 22 },
    { subject: 'Ciencias', 'Superior': 20, 'Alto': 48, 'Básico': 15 },
    { subject: 'Sociales', 'Superior': 27, 'Alto': 39, 'Básico': 20 },
    { subject: 'Inglés', 'Superior': 18, 'Alto': 48, 'Básico': 25 },
];


const staticKpiCards = [
    { title: "Asistencia Promedio", value: "96.8%", icon: CalendarCheck, change: "+1.2% esta semana" },
    { title: "Observaciones Pendientes", value: "3", icon: Activity, change: "2 nuevas hoy" },
];

const recentActivities = [
    { student: "Mateo Garcia", activity: "Nuevo registro de comportamiento", time: "hace 5m", type: "Comportamiento"},
    { student: "Isabella Gonzalez", activity: "Nota actualizada para 'Ciencias'", time: "hace 1h", type: "Calificaciones"},
    { student: "Sofia Rodriguez", activity: "Mensaje de padre recibido", time: "hace 3h", type: "Comunicación"},
    { student: "Santiago Lopez", activity: "Próximo pago pendiente", time: "hace 1d", type: "Facturación"},
]

const WIDGETS_CONFIG_KEY = 'dashboardWidgetConfig';

const defaultWidgetConfig = {
    kpiCards: true,
    performanceChart: true,
    recentActivity: true,
};


export default function Dashboard() {
    const { data: students, isLoading: isLoadingStudents } = useStudents();
    const [widgetConfig, setWidgetConfig] = useState(defaultWidgetConfig);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedConfig = localStorage.getItem(WIDGETS_CONFIG_KEY);
            if (savedConfig) {
                setWidgetConfig(JSON.parse(savedConfig));
            }
        } catch (error) {
            console.error("Error loading dashboard config from localStorage", error);
        }
    }, []);

    const handleWidgetToggle = (widget: keyof typeof defaultWidgetConfig, isVisible: boolean) => {
        const newConfig = { ...widgetConfig, [widget]: isVisible };
        setWidgetConfig(newConfig);
        try {
            localStorage.setItem(WIDGETS_CONFIG_KEY, JSON.stringify(newConfig));
        } catch (error) {
            console.error("Error saving dashboard config to localStorage", error);
        }
    };
    
    const kpiCards = useMemo(() => [
        { 
            title: "Total de Estudiantes", 
            value: isLoadingStudents ? null : (students?.length ?? 0).toString(), 
            icon: Users, 
            change: "+5 desde el mes pasado" 
        },
        ...staticKpiCards
    ], [students, isLoadingStudents]);


  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Panel Principal"
        description="Una vista general de la actividad y el rendimiento de la institución."
        actions={
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Personalizar
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Personalizar Panel</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Seleccione los widgets que desea mostrar en el panel principal.
                        </p>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="kpi-switch" className="font-medium">Tarjetas de Resumen</Label>
                            <Switch
                                id="kpi-switch"
                                checked={widgetConfig.kpiCards}
                                onCheckedChange={(checked) => handleWidgetToggle('kpiCards', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                             <Label htmlFor="chart-switch" className="font-medium">Gráfico de Rendimiento</Label>
                            <Switch
                                id="chart-switch"
                                checked={widgetConfig.performanceChart}
                                onCheckedChange={(checked) => handleWidgetToggle('performanceChart', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                             <Label htmlFor="activity-switch" className="font-medium">Actividad Reciente</Label>
                            <Switch
                                id="activity-switch"
                                checked={widgetConfig.recentActivity}
                                onCheckedChange={(checked) => handleWidgetToggle('recentActivity', checked)}
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        }
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {widgetConfig.kpiCards && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kpiCards.map((card, index) => (
                    <Card key={card.title} className="fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {card.value === null ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <div className="text-2xl font-bold">{card.value}</div>
                            )}
                            <p className="text-xs text-muted-foreground">{card.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {widgetConfig.performanceChart && (
                <div className="lg:col-span-3 fade-in-up" style={{ animationDelay: '450ms' }}>
                    <PerformanceChart data={performanceData} />
                </div>
            )}
            {widgetConfig.recentActivity && (
                 <div className={widgetConfig.performanceChart ? "lg:col-span-2" : "lg:col-span-5"}>
                     <Card className="fade-in-up" style={{ animationDelay: '600ms' }}>
                        <CardHeader>
                            <CardTitle>Actividad Reciente</CardTitle>
                            <CardDescription>Un resumen de los eventos recientes en el sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {recentActivities.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="font-medium">{item.student}</div>
                                                <div className="text-sm text-muted-foreground">{item.activity}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={item.type === 'Comportamiento' ? 'destructive' : 'secondary'}>{item.type}</Badge>
                                                <div className="text-xs text-muted-foreground mt-1">{item.time}</div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
