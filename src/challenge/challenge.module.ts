import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schema/challenge.schema';
import { ChallengeCounter, ChallengeCounterSchema } from './schema/challenge-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeCounter.name, schema: ChallengeCounterSchema },
    ]),
  ],
  providers: [ChallengeService],
  controllers: [ChallengeController]
})
export class ChallengeModule {}
