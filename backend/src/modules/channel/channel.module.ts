import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { DatabaseModule } from '../../database/database.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [DatabaseModule, SyncModule],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
