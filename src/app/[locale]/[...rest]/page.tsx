import { notFound } from "next/navigation";

// Qualquer rota desconhecida cai aqui para renderizar o 404 no idioma certo.
export default function CatchAllPage() {
	notFound();
}
