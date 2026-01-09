'use client';
import { Activity, ArrowUpRight, Users, CalendarCheck } from "lucide-react";
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

const performanceData = [
    { subject: 'Lenguaje', 'Superior': 40, 'Alto': 24, 'Básico': 18 },
    { subject: 'Matemáticas', 'Superior': 30, 'Alto': 13, 'Básico': 22 },
    { subject: 'Ciencias', 'Superior': 20, 'Alto': 48, 'Básico': 15 },
    { subject: 'Sociales', 'Superior': 27, 'Alto': 39, 'Básico': 20 },
    { subject: 'Inglés', 'Superior': 18, 'Alto': 48, 'Básico': 25 },
];


const kpiCards = [
    { title: "Total de Estudiantes", value: "125", icon: Users, change: "+5 desde el mes pasado" },
    { title: "Asistencia Promedio", value: "96.8%", icon: CalendarCheck, change: "+1.2% esta semana" },
    { title: "Observaciones Pendientes", value: "3", icon: Activity, change: "2 nuevas hoy" },
];

const recentActivities = [
    { student: "Mateo Garcia", activity: "Nuevo registro de comportamiento", time: "hace 5m", type: "Comportamiento"},
    { student: "Isabella Gonzalez", activity: "Nota actualizada para 'Ciencias'", time: "hace 1h", type: "Calificaciones"},
    { student: "Sofia Rodriguez", activity: "Mensaje de padre recibido", time: "hace 3h", type: "Comunicación"},
    { student: "Santiago Lopez", activity: "Próximo pago pendiente", time: "hace 1d", type: "Facturación"},
]

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Panel Principal"
        description="Una vista general de la actividad y el rendimiento de la institución."
      />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kpiCards.map((card, index) => (
                <Card key={card.title} className="fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3 fade-in-up" style={{ animationDelay: '450ms' }}>
                <PerformanceChart data={performanceData} />
            </div>
            <div className="lg:col-span-2 fade-in-up" style={{ animationDelay: '600ms' }}>
                 <Card>
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
        </div>
      </main>
    </div>
  );
}
