import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const productStatus = pgEnum("product_status", ["active", "inactive"]);
export const cartStatus = pgEnum("cart_status", ["active", "closed"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "cancelled",
  "fulfilled",
]);
export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
]);
export const contactMessageStatus = pgEnum("contact_message_status", [
  "new",
  "in_progress",
  "resolved",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: varchar("phone", { length: 30 }),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 32 }).notNull().unique(),
  description: varchar("description", { length: 160 }).notNull(),
  ...timestamps,
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("sessions_user_id_index").on(table.userId),
    index("sessions_expires_at_index").on(table.expiresAt),
  ],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 60 }).notNull(),
    recipient: varchar("recipient", { length: 120 }).notNull(),
    line1: varchar("line_1", { length: 160 }).notNull(),
    line2: varchar("line_2", { length: 160 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).default("MX").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps,
  },
  (table) => [index("addresses_user_id_index").on(table.userId)],
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    description: text("description").notNull(),
    sku: varchar("sku", { length: 80 }).notNull().unique(),
    brand: varchar("brand", { length: 100 }),
    frameModel: varchar("frame_model", { length: 100 }),
    gender: varchar("gender", { length: 32 }),
    priceCents: integer("price_cents").notNull(),
    status: productStatus("status").default("active").notNull(),
    ...timestamps,
  },
  (table) => [
    index("products_category_id_index").on(table.categoryId),
    index("products_status_index").on(table.status),
    check("products_price_cents_non_negative", sql`${table.priceCents} >= 0`),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: varchar("alt", { length: 180 }).notNull(),
    position: integer("position").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("product_images_product_id_index").on(table.productId),
    uniqueIndex("product_images_product_position_unique").on(table.productId, table.position),
  ],
);

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 30 }),
  // Horarios no se publican hasta recibir validación comercial.
  openingHours: text("opening_hours"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const inventory = pgTable(
  "inventory",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.branchId] }),
    check("inventory_quantity_non_negative", sql`${table.quantity} >= 0`),
  ],
);

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: cartStatus("status").default("active").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("carts_one_active_user_unique")
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("cart_items_cart_product_unique").on(table.cartId, table.productId),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "restrict" }),
    reference: varchar("reference", { length: 40 }).notNull(),
    idempotencyKey: uuid("idempotency_key").notNull(),
    status: orderStatus("status").default("pending").notNull(),
    currency: varchar("currency", { length: 3 }).default("MXN").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("orders_reference_unique").on(table.reference),
    uniqueIndex("orders_user_idempotency_key_unique").on(table.userId, table.idempotencyKey),
    index("orders_user_id_index").on(table.userId),
    index("orders_branch_id_index").on(table.branchId),
    index("orders_status_index").on(table.status),
    check("orders_subtotal_non_negative", sql`${table.subtotalCents} >= 0`),
    check("orders_total_non_negative", sql`${table.totalCents} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 160 }).notNull(),
    productSku: varchar("product_sku", { length: 80 }).notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    ...timestamps,
  },
  (table) => [
    index("order_items_order_id_index").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check("order_items_price_non_negative", sql`${table.unitPriceCents} >= 0`),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "restrict" }),
    appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
    appointmentTime: time("appointment_time", { withTimezone: false }).notNull(),
    status: appointmentStatus("status").default("scheduled").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("appointments_branch_slot_unique").on(
      table.branchId,
      table.appointmentDate,
      table.appointmentTime,
    ),
    index("appointments_user_id_index").on(table.userId),
  ],
);

export const wishlists = pgTable("wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  ...timestamps,
});

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.wishlistId, table.productId] })],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    message: text("message").notNull(),
    status: contactMessageStatus("status").default("new").notNull(),
    ...timestamps,
  },
  (table) => [index("contact_messages_status_index").on(table.status)],
);
