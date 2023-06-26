import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { Commit, CommitSchema } from './schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from './schema/commit-counter.schema';
import { Challenge, ChallengeSchema } from '../challenge/schema/challenge.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
    ]),
    UserModule,
  ],
  providers: [CommitService],
  controllers: [CommitController],
  exports: [CommitService],
})
export class CommitModule {}
