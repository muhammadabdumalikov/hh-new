import { Injectable } from '@nestjs/common';
import { UserRepo } from './user.repo';
import { ICreateUser } from './interface/user';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) { }

  async getByLinkedinProfileId(profile_id: string) {
    return this.userRepo.getByLinkedinProfileId(profile_id);
  }

  async insertOne(param: ICreateUser) {
    return this.userRepo.insert(param);
  }
}
