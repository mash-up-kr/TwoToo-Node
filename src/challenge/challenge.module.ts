import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';

@Module({
  providers: [ChallengeService],
  controllers: [ChallengeController]
})
export class ChallengeModule {}
