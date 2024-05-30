import {
  Collection,
  Entity,
  Loaded,
  ManyToMany,
  ManyToOne,
  MikroORM,
  OneToMany,
  PrimaryKey,
  Rel,
} from "@mikro-orm/better-sqlite";

@Entity()
class A {
  @PrimaryKey()
  id!: number;

  @ManyToMany(() => B, "a", { owner: true })
  b = new Collection<B>(this);
}

@Entity()
class B {
  @PrimaryKey()
  id!: number;

  @ManyToMany(() => A, "b")
  a = new Collection<A>(this);
}

@Entity()
class C {
  @PrimaryKey()
  id!: number;
}

let orm: MikroORM;

function takesALoadedA(a: Loaded<A>) {}

function takesALoadedAandB(a: Loaded<A, "b">) {}

function takesEverything(a: Loaded<A, "b" | "b.c">) {}

function takesJustNested(a: Loaded<A, "b.c">) {}

function getRange(end: number, start: number = 0): number[] {
  return new Array(end - start + 1).fill(0).map((_, i) => i + start);
}

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ":memory:",
    entities: [A, B, C],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("basic CRUD example", async () => {
  const em = orm.em.fork();
  // This breaks at >=998
  const bs = getRange(1000).map((i) => em.create(B, { id: i }));
  await em.persistAndFlush(bs);

  const a = em.create(A, { id: 1 });
  await em.persistAndFlush(a);

  a.b.add(bs);
  await em.persistAndFlush(a);

  const newBs = getRange(2001, 1001).map((i) => em.create(B, { id: i }));
  await em.persistAndFlush(newBs);

  // Break
  a.b.remove(bs);
  a.b.add(newBs);
  await em.persistAndFlush(a);

  // Break 2
  // await em.transactional(async (em) => {
  //   a.b.removeAll();
  //   await em.persistAndFlush(a);
  //   a.b.set(newBs);
  //   await em.persistAndFlush(a);
  // });
});
