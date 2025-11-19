"use client";
import { useEffect, useState } from "react";
import { CPULoadChart } from "./CPULoadChart";
import { SysInfoChart } from "./SysInfoChart";

const EMPTY_DATA = Array.from({ length: 20 }, (_, i) => ({
	metric: 0,
	timestamp: 0,
}));

export function SystemInformation() {

	const [chartsData, setChartsData] = useState<Record<string, SysChartDefiniton>>({
		cpu: { title: "CPU Usage", description: "%v%", chartData: EMPTY_DATA },
		memory: { title: "Memory Usage", description: "%v%",  chartData: EMPTY_DATA },
		network: { title: "Network", description: "Download: %v | Upload %v",  chartData: EMPTY_DATA, labels: ["Download (Mbps)", "Upload (Mbps)"] },
	});

	async function fetchServerStats() {

		try {

			const res = await fetch("http://localhost:3000/api/health/disk-usage");

			if (res.ok) {

				const data: SysInfo = await res.json();
				const { cpu, mem, network, timestamp } = data;

				const cpuData = { metric: cpu.total, timestamp, max: 100 };
				const memData = { metric: mem.total, timestamp, max: 100 };
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

			{/* <CPULoadChart chartData={cpu.slice(-20)} currentLoad={currentLoad} /> */}
			
			{Object.entries(chartsData).map(([key, data]) => (

				<SysInfoChart
					key={key}
					title={data.title}
					description={data.description}
					chartData={data.chartData}
					labels={data.labels}
				/>

			))}

		</div>

	);
};
