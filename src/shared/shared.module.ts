import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CustomHttpService } from './customHttpService';

@Module({
  imports: [HttpModule],
  providers: [CustomHttpService],
  exports: [CustomHttpService],
})
export class SharedModule {}
