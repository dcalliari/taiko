import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

/** Verificação de saúde para monitoramento e deploy: aplicação no ar e banco acessível. */
export async function GET() {
	const headers = { "Cache-Control": "no-store" };

	try {
		await db.execute(sql`select 1`);
		return Response.json({ status: "ok" }, { headers });
	} catch (error) {
		console.error("Health check: banco inacessível", error);
		return Response.json({ status: "error" }, { status: 503, headers });
	}
}
