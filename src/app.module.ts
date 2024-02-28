import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UserService } from './domain/users/user.service';
import { UserRepo } from './domain/users/user.repo';

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService, UserService, UserRepo],
})
export class AppModule {}
