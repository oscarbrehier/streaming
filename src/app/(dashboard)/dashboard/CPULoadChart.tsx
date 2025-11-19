"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
} from "@/components/ui/chart";

const chartConfig = {
	cpu: {
		label: "CPU Load",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function CPULoadChart({
	chartData,
	currentLoad,
}: {
	chartData: { timecode: string, cpuLoad: number }[],
	currentLoad: number | null,
}) {

	return (

		<Card className="w-96">

			<CardHeader>
				<CardTitle>CPU</CardTitle>
				{currentLoad && (<CardDescription>{Math.round((currentLoad + Number.EPSILON) * 100) / 100}%</CardDescription>)}
			</CardHeader>

			<CardContent>

				<ChartContainer config={chartConfig} className="h-30 w-full">


					<BarChart accessibilityLayer data={chartData}>
						<YAxis domain={[0, 100]} hide />
						<Bar dataKey="cpuLoad" fill="var(--color-cpu)" radius={4} isAnimationActive={false} />

					</BarChart>

				</ChartContainer>

			</CardContent>

		</Card>

	);

};
