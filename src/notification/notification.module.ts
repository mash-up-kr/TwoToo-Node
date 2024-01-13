import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { UserCounter, UserCounterSchema } from 'src/user/schema/user-counter.schema';
import { UserModule } from '../user/user.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => ChallengeModule),
    LoggerModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, AuthGuard, JwtService],
  exports: [NotificationService],
})
export class NotificationModule {}
