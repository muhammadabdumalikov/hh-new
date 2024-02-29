import { Injectable } from '@nestjs/common';
import { CompanyRepo } from './company.repo';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepo: CompanyRepo) { }

  async getByLinkedinProfileId(profile_id: string) {
    return this.companyRepo.getByLinkedinProfileId(profile_id);
  }

  async insertOne(param) {
    return this.companyRepo.insert(param);
  }
}
