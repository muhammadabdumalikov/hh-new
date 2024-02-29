import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UserService } from './domain/users/user.service';
import { UserRepo } from './domain/users/user.repo';
import { CompanyService } from './domain/company/company.service';
import { CompanyRepo } from './domain/company/company.repo';

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService, UserService, UserRepo, CompanyService, CompanyRepo],
})
export class AppModule {}
