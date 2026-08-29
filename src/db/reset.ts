import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./client";
import { seedDatabase } from "./seed";

export async function resetDatabase() {
  await truncateDatabase();
  await seedDatabase();
}

/** Test utility only; it intentionally removes all application data. */
export async function truncateDatabase() {
  await db.execute(
    sql`TRUNCATE TABLE contact_messages, wishlist_items, wishlists, appointments, order_items, orders, cart_items, carts, inventory, product_images, products, categories, branches, addresses, sessions, user_roles, roles, users RESTART IDENTITY CASCADE`,
  );
}
