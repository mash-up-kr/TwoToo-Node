import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ChallengeController } from './challenge/challenge.controller';
import { ChallengeService } from './challenge/challenge.service';
import { CommitModule } from './commit/commit.module';
import { UserController } from './user/user.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { User, UserSchema } from './user/schema/user.schema';
import { UserCounter, UserCounterSchema } from './user/schema/user-counter.schema';
import { jwtConstants } from './auth/constants';

@Module({
  imports: [
    JwtModule.register({
      secret: 'dkTkghdtkaghkdlxld12341234',
      global: true,
      signOptions: {
        expiresIn: '60m'
      }
    }),
    UserModule,
    ChallengeModule,
    CommitModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        useNewUrlParser: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
    ]),
  ],
  controllers: [AppController, ChallengeController, UserController],
  providers: [AppService, ChallengeService, UserService, JwtService],
})
export class AppModule {}
