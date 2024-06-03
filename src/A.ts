import { Entity, PrimaryKey, Enum, Index } from "@mikro-orm/core";
import { ABC } from "./ABC";

@Entity()
export class A {
  @PrimaryKey()
  id!: number;

  @Index({ expression: "create unique index `test` on `a` (t) where id > 2" })
  @Enum(() => ABC)
  t!: ABC;
}
