import { Migration } from '@mikro-orm/migrations';

export class Migration20240603202238 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `a` (`id` integer not null primary key autoincrement, `t` text check (`t` in (\'a\', \'b\')) not null);');

    this.addSql('create table `b` (`id` integer not null primary key autoincrement, `t` text check (`t` in (\'a\')) not null);');
  }

}
