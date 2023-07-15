import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schema/challenge.schema';
import { UserModule } from '../user/user.module';
import { ChallengeCounter, ChallengeCounterSchema } from './schema/challenge-counter.schema';
import { ChallengeValidator } from './challenge.validator';

import { CommitService } from '../commit/commit.service';
import { Commit, CommitSchema } from '../commit/schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from '../commit/schema/commit-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeCounter.name, schema: ChallengeCounterSchema },
      { name: Commit.name, schema: CommitSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
    ]),
    UserModule,
  ],
  providers: [ChallengeService, CommitService, ChallengeValidator],
  controllers: [ChallengeController],
  exports: [ChallengeService],
})
export class ChallengeModule {}
