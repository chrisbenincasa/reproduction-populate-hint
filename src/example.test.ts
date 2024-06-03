import {
  AbstractSqlConnection,
  Entity,
  MikroORM,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/sqlite";
import * as knex from "knex";

declare module "knex/types/tables.js" {
  interface IA {
    id: number;
    x?: string;
    y: string;
    z: string;
  }
  interface Tables {
    a: IA;
  }
}
@Entity()
// We cannot express the partial indexes here (at least I haven't)
// been able to get them to work with a custom expresstion at the entity
// level.
// We want a unique index on (z, y, x) -- however, due to the fact that x
// can be null, it doesn't get considered for unique conflicts (#26 here
// https://sqlite.org/faq.html#q26). As such, we need to define two partial
// indexes, one when x is NULL and one when it is NOT NULL:
//   create unique index a_null (`z`, `y`) on a where `x` is NULL;
//   create unique index a_non_null (`z`, `y`, `x`) on a where `x` is NOT NULL;
// @Unique({
//   name: "a_null",
//   properties: ["z", "y"],
//   expression: "create unique index a_null (`z`, `y`) on a where `x` is NULL;",
// })
class A {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  x?: string;

  @Property()
  y!: string;

  @Property()
  z!: string;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ":memory:",
    entities: [A],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
  const knex = (orm.em.getConnection() as AbstractSqlConnection).getKnex();
  const alter = knex.schema.alterTable("a", (t) => {
    t.unique(["z", "y"], {
      indexName: "a_null",
      predicate: knex.whereNull("x"),
    });
    t.unique(["z", "y", "x"], {
      indexName: "a_non_null",
      predicate: knex.whereNotNull("x"),
    });
  });
  const res = await alter;
  console.log(res);
});

afterAll(async () => {
  await orm.close(true);
});

test("basic CRUD example", async () => {
  const em = orm.em.fork();

  await em.insertMany(A, [
    { y: "y1", z: "z1" },
    { y: "y2", z: "z2", x: "x2" },
  ]);

  // Error:
  // SQLITE_ERROR: ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint
  await expect(() =>
    em.upsert(
      A,
      { y: "y1", z: "z1" },
      {
        onConflictFields: ["z", "y"],
        onConflictAction: "merge",
        onConflictMergeFields: ["z"],
      }
    )
  ).rejects.toThrow();

  await expect(() =>
    em
      .qb(A)
      .insert({ y: "y1", z: "z1" })
      .onConflict(["z", "y"])
      .merge()
      .returning("id")
      .execute()
  ).rejects.toThrow();

  await expect(() =>
    em
      .qb(A)
      .insert({ y: "y1", z: "z1" })
      .onConflict(["z", "y"])
      .where({ x: null })
      .merge()
      .returning("id")
      .execute()
  ).rejects.toThrow();

  await expect(() =>
    em
      .qb(A)
      .insert({ y: "y1", z: "z1" })
      // ???
      // @ts-ignore
      .onConflict(em.getKnex().raw("(`z`, `y`) where x is null"))
      .where({ x: null })
      .merge()
      .returning("id")
      .execute()
  ).rejects.toThrow();

  await expect(() =>
    em.upsert(
      A,
      { y: "y2", z: "z2", x: "x2" },
      {
        onConflictFields: ["z", "y", "x"],
        onConflictAction: "ignore",
      }
    )
  ).rejects.toThrow();

  const knex = em.getKnex();
  const result = await knex("a")
    .insert({ id: 4, y: "y1", z: "z1" })
    .onConflict(knex.raw("(`z`, `y`) where `x` IS NULL"))
    .merge(["id"])
    .returning("id");
  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({ id: 4 });

  // expect(
  //   async () =>
  // ).toThrow();
});
