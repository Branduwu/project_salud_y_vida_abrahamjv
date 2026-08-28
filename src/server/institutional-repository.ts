import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { branches } from "@/db/schema";

export type PublicBranch = { id: string; name: string; slug: string; address: string };

export async function listPublicBranches(): Promise<PublicBranch[]> {
  return db
    .select({
      id: branches.id,
      name: branches.name,
      slug: branches.slug,
      address: branches.address,
    })
    .from(branches)
    .where(eq(branches.isActive, true))
    .orderBy(asc(branches.name));
}
