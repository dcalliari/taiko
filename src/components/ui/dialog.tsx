"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, type HTMLMotionProps, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	overlayClassName?: string;
	children: ReactNode;
}

/**
 * Diálogo modal acessível (foco preso, Esc, clique fora, rolagem travada) com
 * animação de entrada e saída. O conteúdo vai em um <DialogContent>, que
 * precisa de um <DialogTitle>.
 */
export function Dialog({
	open,
	onClose,
	overlayClassName,
	children,
}: DialogProps) {
	return (
		<DialogPrimitive.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onClose();
				}
			}}
		>
			<AnimatePresence>
				{open && (
					<DialogPrimitive.Portal forceMount>
						<DialogPrimitive.Overlay asChild forceMount>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className={cn("fixed inset-0 z-50", overlayClassName)}
							/>
						</DialogPrimitive.Overlay>
						{children}
					</DialogPrimitive.Portal>
				)}
			</AnimatePresence>
		</DialogPrimitive.Root>
	);
}

export function DialogContent(props: HTMLMotionProps<"div">) {
	return (
		<DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
			<motion.div {...props} />
		</DialogPrimitive.Content>
	);
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogClose = DialogPrimitive.Close;
