import { Migration } from '@mikro-orm/migrations';

export class Migration20240603202254 extends Migration {

  async up(): Promise<void> {
    this.addSql('CREATE TABLE `_knex_temp_alter011` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `t` text check (`t` in (\'a\', \'b\', \'c\')) NOT NULL CHECK (`t` in(\'a\' , \'b\')));');
    this.addSql('INSERT INTO "_knex_temp_alter011" SELECT * FROM "a";;');
    this.addSql('DROP TABLE "a";');
    this.addSql('ALTER TABLE "_knex_temp_alter011" RENAME TO "a";');
  }

}
