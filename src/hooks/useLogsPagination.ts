"use client"

import { getLogEntries } from "@/lib/api/logs";
import { useMemo, useState } from "react";

export function useLogsPagination({
	initialLogs,
	totalEntries,
	pageSize: initialPageSize,
}: {
	initialLogs: AuditLogs[];
	totalEntries: number;
	pageSize?: number;
}) {

	const [pageSize, setPageSize] = useState(initialPageSize ?? 10);
	const [pageIndex, setPageIndex] = useState(1);
	const [logs, setLogs] = useState<AuditLogs[]>(initialLogs);
	const [search, setSearch] = useState("");
	const [actionFilter, setActionFilter] = useState<string>("all")

	const filteredLogs = useMemo(() => {

		return logs.filter((log) => {

			const matchesSearch =
				search.toLowerCase() === "" ||
				log.user_id.toLowerCase().includes(search.toLowerCase()) ||
				log.resource.toLowerCase().includes(search.toLowerCase()) ||
				log.action.toLowerCase().includes(search.toLowerCase())

			const matchesFilter = actionFilter === "all" || log.action === actionFilter;

			return matchesSearch && matchesFilter;

		});

	}, [search, actionFilter, logs]);

	async function previousPage() {

		if (pageIndex <= 1) return;

		const newPage = pageIndex - 1;
		const res = await getLogEntries(newPage, pageSize);

		setLogs(res.data);
		setPageIndex(newPage);

	};

	async function nextPage() {

		const totalPages = Math.ceil(totalEntries / 10);
		if (pageIndex >= totalPages) return;

		const newPage = pageIndex + 1;
		const res = await getLogEntries(newPage, pageSize);

		setLogs(res.data);
		setPageIndex(newPage);

	};

	const canPreviousPage = pageIndex > 1;
	const canNextPage = pageIndex < Math.ceil(totalEntries / 10);

	return {
		pageIndex,
		search, setSearch,
		logs, filteredLogs,
		actionFilter, setActionFilter,
		previousPage, nextPage,
		canPreviousPage, canNextPage
	}

};