"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig = {
  Superior: {
    label: "Superior",
    color: "hsl(var(--primary))",
  },
  Alto: {
    label: "Alto",
    color: "hsl(var(--accent))",
  },
  Básico: {
    label: "Básico",
    color: "hsl(var(--secondary))",
  },
}

export function PerformanceChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Desempeño Estudiantil</CardTitle>
        <CardDescription>Niveles de desempeño por materia - Trimestre 1</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Superior" stackId="a" fill="var(--color-Superior)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Alto" stackId="a" fill="var(--color-Alto)" />
            <Bar dataKey="Básico" stackId="a" fill="var(--color-Básico)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
