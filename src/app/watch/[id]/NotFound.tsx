// import { IconFolderCode } from "@tabler/icons-react";
import { ArrowUpRightIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";

export function MediaNotFound() {

	return (

		<div className="h-screen w-full flex items-center">

			<Empty>

				<EmptyHeader>

					<EmptyMedia variant="icon">
						<Film />
					</EmptyMedia>

					<EmptyTitle>Media not found</EmptyTitle>
					<EmptyDescription>
						The request media has not been found in our library
					</EmptyDescription>

				</EmptyHeader>

				<EmptyContent>
					<div className="flex gap-2">

						<Button
							asChild
						>
							<Link
								href="/search"
							>
								Search Again
							</Link>
						</Button>

						<Button
							asChild
							variant="outline"
						>
							<Link
								href="/"
							>
								Browse Library
							</Link>
						</Button>
					</div>
				</EmptyContent>

			</Empty>

		</div>

	);

};
