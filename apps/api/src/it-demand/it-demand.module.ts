import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ItDemandController } from './it-demand.controller';
import { ItDemandService } from './it-demand.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ItDemandController],
  providers: [ItDemandService],
})
export class ItDemandModule {}
