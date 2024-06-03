import { Migration } from '@mikro-orm/migrations';

export class Migration20240603203933 extends Migration {

  async up(): Promise<void> {
    this.addSql('create unique index `test` on `a` (t) where id > 2;');
  }

}
