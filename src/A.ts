import { Entity, PrimaryKey, Enum } from "@mikro-orm/core";
import { ABC } from "./ABC";

@Entity()
export class A {
  @PrimaryKey()
  id!: number;

  @Enum(() => ABC)
  t!: ABC;
}
