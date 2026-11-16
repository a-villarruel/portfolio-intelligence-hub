import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ItDemandModule } from './it-demand/it-demand.module';

@Module({
  imports: [DatabaseModule, ItDemandModule],
  controllers: [AppController],
})
export class AppModule {}
