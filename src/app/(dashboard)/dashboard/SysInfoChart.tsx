"use client"

import { Bar, BarChart, YAxis } from "recharts"
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
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

const chartConfig = {
	metric_0: {
		label: "Metric 1",
		color: "var(--chart-1)",
	},
	metric_1: {
		label: "Metric 2",
		color: "var(--chart-2)"
	}
} satisfies ChartConfig;

export function SysInfoChart({
	title,
	description,
	chartData,
	labels
}: {
	title: string;
	description: string;
	chartData: SysMetric[];
	labels?: string[];
}) {

	const isArrayMetric = Array.isArray(chartData[chartData.length - 1]?.metric);

	const chartConfig: ChartConfig = isArrayMetric
		? Object.fromEntries(
			(chartData[chartData.length - 1]?.metric as number[]).map((item, index) => [
				`metric_${index}`,
				{
					label: labels?.[index] || `Metric ${index + 1}`,
					color: `var(--chart-${index + 1})`
				}
			])
		) : {
			metric_0: {
				label: labels?.[0] || "Metric 1",
				color: "var(--chart-1)",
			},
		};

	const normalizedData = chartData.map(item => {

		if (Array.isArray(item.metric)) {

			const obj: Record<string, number> = {};

			item.metric.forEach((value, i) => {
				obj[`metric_${i}`] = value;
			});

			return { ...item, ...obj };

		}

		return item;

	});

	const lastItem = chartData.at(-1);

	const parsedDescription = isArrayMetric
		? (lastItem?.metric as number[]).reduce(
			(desc, value) => desc.replace(/%v/, value.toFixed(2)),
			description
		)
		: description.replace(/%v/, (lastItem?.metric as number).toFixed(2));

	return (

		<Card className="w-96">

			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{parsedDescription}</CardDescription>
			</CardHeader>

			<CardContent>

				<ChartContainer config={chartConfig} className="h-30 w-full">


					<BarChart accessibilityLayer data={normalizedData}>

						{lastItem?.max && <YAxis domain={[0, lastItem.max]} hide />}

						{
							isArrayMetric ? (chartData[chartData.length - 1]?.metric as number[]).map((_, index) => (

								<Bar key={index} dataKey={`metric_${index}`} fill={`var(--color-metric_${index})`} radius={4} isAnimationActive={false} />

							)) : (
								<Bar dataKey="metric" fill="var(--color-metric_0)" radius={4} isAnimationActive={false} />
							)
						}

						{isArrayMetric && (<ChartLegend content={<ChartLegendContent />} />)}

					</BarChart>

				</ChartContainer>

			</CardContent>

		</Card>

	);

};
