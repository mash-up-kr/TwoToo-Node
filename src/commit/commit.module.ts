import { Module } from '@nestjs/common';
import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';

@Module({
  controllers: [CommitController],
  providers: [CommitService]
})
export class CommitModule {}
