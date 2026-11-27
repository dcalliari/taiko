"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";

interface LegalModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	lastUpdated: string;
	children: ReactNode;
}

/** Moldura dos textos legais (privacidade, termos) abertos a partir do rodapé. */
export default function LegalModal({
	isOpen,
	onClose,
	title,
	lastUpdated,
	children,
}: LegalModalProps) {
	const t = useTranslations("a11y");

	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			overlayClassName="bg-black/80 backdrop-blur-sm"
		>
			<div className="fixed inset-0 z-50 flex items-center justify-center">
				<DialogContent
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ duration: 0.3 }}
					className="relative w-full h-full md:w-[90%] md:h-[90%] md:max-w-4xl bg-background md:rounded-lg overflow-hidden flex flex-col"
				>
					{/* Header */}
					<div className="bg-muted py-6 px-6 md:px-8 flex items-center justify-between border-b border-border">
						<div>
							<DialogTitle className="font-heading font-black text-2xl md:text-3xl text-foreground">
								{title}
							</DialogTitle>
							<p className="text-muted-foreground text-sm mt-1">
								{lastUpdated}
							</p>
						</div>
						<DialogClose
							className="p-2 hover:bg-background rounded-full transition-colors"
							aria-label={t("close")}
						>
							<X className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
						</DialogClose>
					</div>

					{/* Content */}
					{/* biome-ignore lint/a11y/noNoninteractiveTabindex: região rolável precisa receber foco para rolar pelo teclado */}
					<div tabIndex={0} className="flex-1 overflow-y-auto p-6 md:p-8">
						<div className="max-w-3xl mx-auto">{children}</div>
					</div>
				</DialogContent>
			</div>
		</Dialog>
	);
}

interface LegalSectionProps {
	title: string;
	content: string;
	items?: string[];
	children?: ReactNode;
}

export function LegalSection({
	title,
	content,
	items,
	children,
}: LegalSectionProps) {
	return (
		<section className="mb-10">
			<h3 className="font-heading font-bold text-xl text-foreground mb-4">
				{title}
			</h3>
			<p
				className={`text-muted-foreground leading-relaxed ${items ? "mb-4" : ""}`}
			>
				{content}
			</p>
			{items && (
				<ul className="list-disc list-inside text-muted-foreground space-y-2">
					{items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			)}
			{children}
		</section>
	);
}

export function LegalContactEmail() {
	return (
		<p className="text-muted-foreground mt-2">
			<strong>Email:</strong> contato@kodonamazontaiko.com.br
		</p>
	);
}
