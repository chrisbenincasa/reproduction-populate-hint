import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config";

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init(config);
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("basic example", async () => {});
