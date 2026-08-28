import { hash } from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { roles, userRoles, users } from "@/db/schema";

const bootstrapInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Escribe un correo válido.")),
  name: z.string().trim().min(2, "Escribe el nombre del administrador.").max(120).optional(),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres.")
    .max(128)
    .optional(),
});

export type AdminBootstrapResult = {
  email: string;
  status: "created" | "promoted" | "already_admin";
};

export async function createOrPromoteAdmin(input: unknown): Promise<AdminBootstrapResult> {
  const parsed = bootstrapInputSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");

  const [knownUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!knownUser && (!parsed.data.name || !parsed.data.password)) {
    throw new Error(
      "ADMIN_BOOTSTRAP_NAME and ADMIN_BOOTSTRAP_PASSWORD are required to create a new administrator.",
    );
  }

  const passwordHash = parsed.data.password ? await hash(parsed.data.password, 12) : undefined;

  return db.transaction(async (tx) => {
    await tx
      .insert(roles)
      .values([
        { key: "ADMIN", description: "Administrador autorizado" },
        { key: "USER", description: "Usuario registrado" },
      ])
      .onConflictDoNothing();

    const roleRows = await tx
      .select({ id: roles.id, key: roles.key })
      .from(roles)
      .where(inArray(roles.key, ["ADMIN", "USER"]));
    const adminRole = roleRows.find((role) => role.key === "ADMIN");
    if (!adminRole) throw new Error("The ADMIN role is missing from the database.");

    let [user] = await tx
      .select({ id: users.id, isActive: users.isActive })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);
    let created = false;

    if (!user) {
      const [newUser] = await tx
        .insert(users)
        .values({
          name: parsed.data.name!,
          email: parsed.data.email,
          passwordHash: passwordHash!,
        })
        .returning({ id: users.id, isActive: users.isActive });
      if (!newUser) throw new Error("Could not create the administrator account.");
      user = newUser;
      created = true;
    }

    if (!user.isActive) throw new Error("Cannot promote an inactive user.");

    const insertedRole = await tx
      .insert(userRoles)
      .values({ userId: user.id, roleId: adminRole.id })
      .onConflictDoNothing()
      .returning({ userId: userRoles.userId });

    return {
      email: parsed.data.email,
      status: created ? "created" : insertedRole[0] ? "promoted" : "already_admin",
    };
  });
}
