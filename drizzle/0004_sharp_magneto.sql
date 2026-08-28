ALTER TABLE "order_items" ADD COLUMN "product_sku" varchar(80);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "branch_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reference" varchar(40);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" uuid;--> statement-breakpoint
UPDATE "order_items" SET "product_sku" = "products"."sku" FROM "products" WHERE "order_items"."product_id" = "products"."id";--> statement-breakpoint
UPDATE "orders" SET "branch_id" = (SELECT "id" FROM "branches" WHERE "is_active" = true ORDER BY "name" LIMIT 1), "reference" = concat('SV-LEGACY-', replace("id"::text, '-', '')), "idempotency_key" = "id" WHERE "reference" IS NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_sku" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "branch_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "reference" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "idempotency_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_reference_unique" ON "orders" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_user_idempotency_key_unique" ON "orders" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "orders_branch_id_index" ON "orders" USING btree ("branch_id");
