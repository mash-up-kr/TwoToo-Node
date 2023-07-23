import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserCounter, UserCounterSchema } from './schema/user-counter.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Challenge, ChallengeSchema } from 'src/challenge/schema/challenge.schema';
import {
  ChallengeCounter,
  ChallengeCounterSchema,
} from 'src/challenge/schema/challenge-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeCounter.name, schema: ChallengeCounterSchema },
    ]),
  ],
  providers: [UserService, ChallengeService, AuthGuard, JwtService],
  controllers: [UserController],
  exports: [UserService, AuthGuard, JwtService],
})
export class UserModule {}
