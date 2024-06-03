import { Entity, Enum, PrimaryKey } from "@mikro-orm/core";
import { ABC2 } from "./ABC";

@Entity()
export class B {
  @PrimaryKey()
  id!: number;

  @Enum(() => ABC2)
  t!: ABC2;
}
