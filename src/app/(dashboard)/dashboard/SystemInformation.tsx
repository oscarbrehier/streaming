"use client";
import { useEffect, useState } from "react";
import { SysInfoChart } from "./SysInfoChart";

const EMPTY_DATA = (items?: number) => Array.from({ length: 20 }, (_, i) => ({
	metric: items ? Array(items).fill(0) : 0,
	timestamp: 0,
}));

export function SystemInformation() {

	const [chartsData, setChartsData] = useState<Record<string, SysChartDefiniton>>({
		cpu: { title: "CPU Usage", description: "%v%", chartData: EMPTY_DATA(0), max: 100 },
		memory: { title: "Memory Usage", description: "%v%",  chartData: EMPTY_DATA(0), max: 100 },
		network: { title: "Network", description: "Download: %v | Upload %v",  chartData: EMPTY_DATA(2), labels: ["Download (Mbps)", "Upload (Mbps)"] },
	});

	async function fetchServerStats() {

		try {

			const res = await fetch("http://localhost:3001/api/health/system");

			if (res.ok) {

				const { results, error }: { results?: SysInfo, error?: string } = await res.json();
				if (error || !results) return ;

				const { cpu, mem, network, timestamp } = results;

				const cpuData = { metric: cpu.total, timestamp };
				const memData = { metric: mem.usedPercent, timestamp };
				const netData = { metric: [network.rx, network.tx], timestamp };

				console.log(netData);

				setChartsData(prev => ({
					cpu: { ...prev.cpu, chartData: [...prev.cpu.chartData, cpuData].slice(-20) },
					memory: { ...prev.memory, chartData: [...prev.memory.chartData, memData].slice(-20) },
					network: { ...prev.network, chartData: [...prev.network.chartData, netData].slice(-10) },
				}));

			};

		} catch (error) {
			console.error("Failed to fetch server stats:", error);
		}
	};

	useEffect(() => {
		const fetchInterval = setInterval(fetchServerStats, 5 * 1000);
		return () => {
			clearInterval(fetchInterval);
		};
	}, []);

	return (

		<div className="text-4xl text-white font-semibold w-full grid grid-cols-3 gap-4">
			
			{Object.entries(chartsData).map(([key, data]) => (

				<SysInfoChart
					key={key}
					title={data.title}
					description={data.description}
					chartData={data.chartData}
					labels={data.labels}
					max={data.max}
				/>

			))}

		</div>

	);
};
