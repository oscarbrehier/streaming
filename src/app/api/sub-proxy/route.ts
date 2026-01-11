import { NextRequest, NextResponse } from 'next/server';

function srtToVtt(srt: string): string {

	srt = srt.replace(/^\uFEFF/, '');

	let vtt = 'WEBVTT\n\n';

	vtt += srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
	vtt = vtt.replace(/\n\d+\n/g, '\n');

	return vtt;

};

export async function GET(request: NextRequest) {

	const url = request.nextUrl.searchParams.get('url');

	if (!url) {
		return new NextResponse('URL parameter required', { status: 400 });
	};

	try {

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
		});

		if (!response.ok) {
			return new NextResponse(`Subtitle fetch failed: ${response.status}`, {
				status: response.status
			});
		}

		let subtitle = await response.text();

		if (!subtitle.startsWith('WEBVTT')) {
			subtitle = srtToVtt(subtitle);
		};

		return new NextResponse(subtitle, {
			headers: {
				'Content-Type': 'text/vtt; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			},
		});

	} catch (error) {

		console.error('[Sub Proxy Error]:', error);
		return new NextResponse('Subtitle Proxy error', { status: 500 });

	};

};