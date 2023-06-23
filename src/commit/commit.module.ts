import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { Commit, CommitSchema } from './schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from './schema/commit-counter.schema';
import { Challenge, ChallengeSchema } from '../challenge/schema/challenge.schema';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
    ]),
  ],
  providers: [CommitService, AuthGuard, JwtService],
  controllers: [CommitController],
})
export class CommitModule {}
