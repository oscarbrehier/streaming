import { cn } from "@/lib/utils";

const orbColors = {
	coral: 'var(--color-coral)',
	lavender: 'var(--color-lavender)',
	peach: 'var(--color-peach)',
	olive: 'var(--color-olive)',
	periwinkle: 'var(--color-periwinkle)',
	mint: 'var(--color-mint)',
	rose: 'var(--color-rose)',
	apricot: 'var(--color-apricot)',
} as const;

type OrbColor = keyof typeof orbColors;

interface Blob {
	color: OrbColor;
	top?: string;
	left?: string;
	right?: string;
	bottom?: string;
	size?: string;
	opacity?: number;
}

interface BlobBackgroundProps {
	blobs?: Blob[];
	className?: string;
	children?: React.ReactNode;
}

const defaultBlobs: Blob[] = [
	{ color: 'coral', top: '10%', left: '15%', size: '800px', opacity: 0.22 },
	{ color: 'lavender', top: '50%', right: '10%', size: '500px', opacity: 0.22 },
	{ color: 'peach', bottom: '5%', left: '40%', size: '600px', opacity: 0.22 },
];

export function BlobBackground({ blobs = defaultBlobs, className, children }: BlobBackgroundProps) {

	return (

		<div className={cn("relative", className)}>

			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				{blobs.map((blob, i) => (
					<div
						key={i}
						className="absolute rounded-full"
						style={{
							top: blob.top,
							left: blob.left,
							right: blob.right,
							bottom: blob.bottom,
							width: blob.size ?? '500px',
							height: blob.size ?? '500px',
							background: `radial-gradient(circle, color-mix(in srgb, ${orbColors[blob.color]} ${(blob.opacity ?? 0.1) * 100}%, transparent) 0%, transparent 70%)`,
							transform: 'translate(-50%, -50%)',
							filter: 'blur(60px)',
						}}
					/>
				))}
			</div>

			<div className="relative z-10">
				{children}
			</div>
		</div>

	);
	
};