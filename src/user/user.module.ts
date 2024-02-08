import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserCounter, UserCounterSchema } from './schema/user-counter.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { Challenge, ChallengeSchema } from 'src/challenge/schema/challenge.schema';
import {
  ChallengeCounter,
  ChallengeCounterSchema,
} from 'src/challenge/schema/challenge-counter.schema';
import { ChallengeModule } from 'src/challenge/challenge.module';
import { LoggerModule } from 'src/logger/logger.module';
import { Commit, CommitSchema } from 'src/commit/schema/commit.schema';
import { CommitModule } from 'src/commit/commit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeCounter.name, schema: ChallengeCounterSchema },
      { name: Commit.name, schema: CommitSchema },
    ]),
    forwardRef(() => CommitModule),
    forwardRef(() => ChallengeModule),
    LoggerModule,
  ],
  providers: [UserService, AuthGuard, JwtService],
  controllers: [UserController],
  exports: [UserService, AuthGuard, JwtService],
})
export class UserModule {}
