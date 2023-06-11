import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ChallengeController } from './challenge/challenge.controller';
import { ChallengeService } from './challenge/challenge.service';
import { CommitModule } from './commit/commit.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [UserModule, ChallengeModule, CommitModule, MongooseModule.forRoot("mongodb+srv://hyun:12341234@cluster0.xstvm.mongodb.net/")],
  controllers: [AppController, UserController, ChallengeController],
  providers: [AppService, UserService, ChallengeService],
})
export class AppModule { }
