import { defineConfig } from "@mikro-orm/sqlite";
import { A } from "./A";
import { B } from "./B";
import { Migrator } from "@mikro-orm/migrations";

export default defineConfig({
  dbName: process.env.DB_NAME ?? "test.db",
  entities: [A, B],
  migrations: {
    pathTs: "./src/migrations",
  },
  extensions: [Migrator],
});
