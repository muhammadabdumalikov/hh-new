import { Injectable } from '@nestjs/common';
import { BaseRepo } from 'src/providers/base-dao';

@Injectable()
export class UserRepo extends BaseRepo<any> {
  constructor() {
    super('users');
  }

  getByLinkedinProfileId(profile_id: string) {
    return this.knex()
      .select('*')
      .from(this._tableName)
      .where('linkedin_profile_id', profile_id)
      .where('is_deleted', false)
      .first();
  }
}
