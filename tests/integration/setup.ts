import { config } from "dotenv";

// Las pruebas de integración nunca deben conectarse a la base de desarrollo.
// En CI el valor se inyecta por variables del job; localmente se usa .env.test.
if (!process.env.CI) {
  config({ path: ".env.test", override: true });
}
