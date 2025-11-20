"use client"

import { Area, AreaChart, Bar, BarChart, YAxis } from "recharts"
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
	labels,
	max,
}: {
	title: string;
	description: string;
	chartData: SysMetric[];
	labels?: string[];
	max?: number;
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

					<AreaChart accessibilityLayer data={normalizedData}>

						{max && <YAxis domain={[0, max]} hide />}

						<defs>

							{
								isArrayMetric ? (chartData[chartData.length - 1]?.metric as number[]).map((_, index) => (

									<linearGradient
										key={index}
										x1="0" y1="0" x2="0" y2="1"
										id={`fill_${index}`}
									>

										<stop
											offset="5%"
											stopColor={`var(--color-metric_${index})`}
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor={`var(--color-metric_${index})`}
											stopOpacity={0.1}
										/>

									</linearGradient>

								)) : (
									
									<linearGradient
										x1="0" y1="0" x2="0" y2="1"
										id={`fill_0`}
									>

										<stop
											offset="5%"
											stopColor={`var(--color-metric_0)`}
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor={`var(--color-metric_0)`}
											stopOpacity={0.1}
										/>

									</linearGradient>

								)
							}

						</defs>

						{
							isArrayMetric
								? (chartData[chartData.length - 1]?.metric as number[]).map((_, index) => (

									<Area
										key={index}
										dataKey={`metric_${index}`}
										type="natural"
										fill={`url(#fill_${index})`}
										fillOpacity={0.4}
										stroke={`var(--color-metric_${index})`}
										stackId="a"
										isAnimationActive={false}
									/>

								))
								: (

									<Area
										dataKey="metric"
										type="natural"
										fill="url(#fill_0)"
										fillOpacity={0.4}
										stroke="var(--color-metric_0)"
										stackId="a"
										isAnimationActive={false}
									/>

								)
						}

						{isArrayMetric && (<ChartLegend content={<ChartLegendContent />} />)}

					</AreaChart>

					{/* 
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

					</BarChart> */}

				</ChartContainer>

			</CardContent>

		</Card>

	);

};
