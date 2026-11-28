import { fold } from "@/lib/notacao/format";
import type { Song } from "@/lib/notacao/model";
import type { PdfOptions } from "@/lib/notacao/pdf";

/**
 * Builds the PDF in the browser and hands it to the user as a download.
 * jsPDF is loaded on demand, so pages that never export do not pay for it.
 */
export async function downloadSongPdf(
	song: Song,
	options: PdfOptions = {},
): Promise<void> {
	const { songToPdf } = await import("@/lib/notacao/pdf");
	const bytes = songToPdf(song, options);
	const url = URL.createObjectURL(
		new Blob([bytes], { type: "application/pdf" }),
	);
	const name = fold(song.title).replace(/[^a-z0-9]+/g, "-") || "ficha";
	const link = document.createElement("a");
	link.href = url;
	link.download = `${name}-${options.view ?? "ficha"}.pdf`;
	link.click();
	// The click is handled asynchronously; revoking right away cancels it.
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
