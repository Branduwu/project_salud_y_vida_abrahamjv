CREATE TYPE "public"."cart_status" AS ENUM('active', 'closed');--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_unique";--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "status" "cart_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "carts_one_active_user_unique" ON "carts" USING btree ("user_id") WHERE "carts"."status" = 'active';