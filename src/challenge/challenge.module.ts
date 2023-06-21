import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schema/challenge.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }]),
    UserModule,
  ],
  providers: [ChallengeService],
  controllers: [ChallengeController],
})
export class ChallengeModule {}
