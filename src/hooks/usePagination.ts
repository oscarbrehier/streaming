"use client"

import { useState } from "react";

export function usePagination<T>({
	initialData,
	totalEntries,
	pageSize: initialPageSize,
	fetchDataFn
}: {
	initialData: T[];
	totalEntries: number;
	pageSize?: number;
	fetchDataFn: (pageIndex: number, pageSize: number) => Promise<{ data: T[] }>;
}) {

	const [pageSize, setPageSize] = useState(initialPageSize ?? 10);
	const [pageIndex, setPageIndex] = useState(1);
	const [data, setData] = useState<T[]>(initialData);

	async function previousPage() {

		if (pageIndex <= 1) return;

		const newPage = pageIndex - 1;
		const res = await fetchDataFn(newPage, pageSize);

		setData(res.data);
		setPageIndex(newPage);

	};

	async function nextPage() {

		const totalPages = Math.ceil(totalEntries / 10);
		if (pageIndex >= totalPages) return;

		const newPage = pageIndex + 1;
		const res = await fetchDataFn(newPage, pageSize);

		setData(res.data);
		setPageIndex(newPage);

	};

	const canPreviousPage = pageIndex > 1;
	const canNextPage = pageIndex < Math.ceil(totalEntries / 10);

	return {
		pageIndex,
		data,
		previousPage, nextPage,
		canPreviousPage, canNextPage
	}

};