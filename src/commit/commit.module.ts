import { Module } from '@nestjs/common';
import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Commit, CommitSchema } from './schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from './schema/commit-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
    ]),
  ],
  providers: [CommitService],
  controllers: [CommitController]
})
export class CommitModule {}
