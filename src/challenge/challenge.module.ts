import { Module, forwardRef } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schema/challenge.schema';
import { UserModule } from '../user/user.module';
import { ChallengeCounter, ChallengeCounterSchema } from './schema/challenge-counter.schema';
import { ChallengeValidator } from './challenge.validator';

import { Commit, CommitSchema } from '../commit/schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from '../commit/schema/commit-counter.schema';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { CommitModule } from 'src/commit/commit.module';
import { ViewModule } from 'src/view/view.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeCounter.name, schema: ChallengeCounterSchema },
      { name: Commit.name, schema: CommitSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => CommitModule),
    forwardRef(() => ViewModule),
  ],
  providers: [ChallengeService, ChallengeValidator],
  controllers: [ChallengeController],
  exports: [ChallengeService],
})
export class ChallengeModule {}
