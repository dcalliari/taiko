"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
	// Respeita "reduzir movimento" do sistema: deslocamentos e zooms são
	// desligados, transições de opacidade continuam.
	return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
