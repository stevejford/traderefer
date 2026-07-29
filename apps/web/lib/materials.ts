import { sql } from "@/lib/db";

export type JobMaterial = {
    name: string;
    unit: string;
    qty_note: string | null;
    optional: boolean;
    price_low: number | null;
    price_typical: number | null;
    price_high: number | null;
    sampled_at: string | null;
};

/**
 * Materials mapped to a job slug, each with the latest sampled retail price
 * range (null until a sample lands — the card renders those rows without a
 * price). Data layer: scripts/materials/. Returns [] on any failure so pages
 * never break on this module.
 */
export async function getJobMaterials(jobSlug: string): Promise<JobMaterial[]> {
    try {
        return await sql<JobMaterial[]>`
            SELECT m.name,
                   m.unit,
                   jm.qty_note,
                   jm.optional,
                   p.price_low::float AS price_low,
                   p.price_typical::float AS price_typical,
                   p.price_high::float AS price_high,
                   p.sampled_at::text AS sampled_at
            FROM job_materials jm
            JOIN materials m ON m.id = jm.material_id
            LEFT JOIN LATERAL (
                SELECT price_low, price_typical, price_high, sampled_at
                FROM material_prices mp
                WHERE mp.material_id = m.id
                ORDER BY mp.sampled_at DESC
                LIMIT 1
            ) p ON true
            WHERE jm.job_slug = ${jobSlug}
            ORDER BY jm.optional ASC, jm.sort ASC
        `;
    } catch {
        return [];
    }
}
