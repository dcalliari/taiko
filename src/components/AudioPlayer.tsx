import { motion, useInView } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

const AudioPlayer = () => {
	const sectionRef = useRef(null);
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isMuted, setIsMuted] = useState(false);

	const togglePlay = () => {
		setIsPlaying(!isPlaying);
		// Simulate progress when playing
		if (!isPlaying) {
			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						setIsPlaying(false);
						clearInterval(interval);
						return 0;
					}
					return prev + 0.5;
				});
			}, 100);
		}
	};

	return (
		<section
			id="musica"
			ref={sectionRef}
			className="section-padding bg-background relative overflow-hidden"
		>
			{/* Background pattern */}
			<div className="absolute inset-0 bg-kodon-pattern opacity-50" />

			<div className="container mx-auto px-4 relative">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="max-w-2xl mx-auto text-center"
				>
					<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
						Ouça Nossa Música
					</span>
					<h2 className="heading-section text-foreground mb-8">
						AMOSTRA DO NOSSO SOM
					</h2>

					<div className="w-20 h-1 bg-primary mx-auto mb-12" />

					{/* Audio Player Card */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={isInView ? { opacity: 1, scale: 1 } : {}}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="bg-muted rounded-lg p-8 shadow-xl"
					>
						<div className="flex items-center gap-6">
							{/* Play Button */}
							<button
								type="button"
								onClick={togglePlay}
								className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30"
								aria-label={isPlaying ? "Pausar" : "Reproduzir"}
							>
								{isPlaying ? (
									<Pause className="w-6 h-6" />
								) : (
									<Play className="w-6 h-6 ml-1" />
								)}
							</button>

							{/* Track Info & Progress */}
							<div className="flex-1 text-left">
								<h4 className="font-heading font-bold text-primary-foreground mb-1">
									Ritmo da Floresta
								</h4>
								<p className="text-sm text-muted-foreground mb-3">
									Kodon Amazon Taiko • 2024
								</p>

								{/* Progress Bar */}
								<div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
									<motion.div
										className="absolute top-0 left-0 h-full bg-primary rounded-full"
										style={{ width: `${progress}%` }}
										transition={{ duration: 0.1 }}
									/>
								</div>

								<div className="flex justify-between mt-2 text-xs text-muted-foreground">
									<span>
										{Math.floor(((progress / 100) * 180) / 60)}:
										{String(Math.floor((progress / 100) * 180) % 60).padStart(
											2,
											"0",
										)}
									</span>
									<span>3:00</span>
								</div>
							</div>

							{/* Volume Button */}
							<button
								type="button"
								onClick={() => setIsMuted(!isMuted)}
								className="flex-shrink-0 p-3 text-muted-foreground hover:text-primary transition-colors"
								aria-label={isMuted ? "Ativar som" : "Silenciar"}
							>
								{isMuted ? (
									<VolumeX className="w-6 h-6" />
								) : (
									<Volume2 className="w-6 h-6" />
								)}
							</button>
						</div>
					</motion.div>

					<p className="text-muted-foreground mt-8">
						Uma fusão única de percussão tradicional japonesa com ritmos
						amazônicos.
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default AudioPlayer;
