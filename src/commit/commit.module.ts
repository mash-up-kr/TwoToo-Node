import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { Commit, CommitSchema } from './schema/commit.schema';
import { CommitCounter, CommitCounterSchema } from './schema/commit-counter.schema';
import { Challenge, ChallengeSchema } from '../challenge/schema/challenge.schema';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from './multer.option';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './s3.service';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commit.name, schema: CommitSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: CommitCounter.name, schema: CommitCounterSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [CommitService, FileService],
  controllers: [CommitController],
  exports: [CommitService],
})
export class CommitModule {}
