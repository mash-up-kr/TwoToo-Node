import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChallengeModule } from './challenge/challenge.module';
import { CommitModule } from './commit/commit.module';
import { UserController } from './user/user.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { User, UserSchema } from './user/schema/user.schema';
import { UserCounter, UserCounterSchema } from './user/schema/user-counter.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        global: true,
        signOptions: {
          expiresIn: '60m'
        }
      })
    }),
    ChallengeModule,
    CommitModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        useNewUrlParser: true,
      }),
      inject: [ConfigService],
    }),
    UserModule
  ],

  controllers: [AppController],
  providers: [AppService,  JwtService],
})
export class AppModule {}
