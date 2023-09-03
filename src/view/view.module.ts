import { Module, forwardRef } from '@nestjs/common';
import { ViewController } from './view.controller';
import { UserModule } from '../user/user.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { CommitModule } from '../commit/commit.module';
import { HomeViewService } from './homeView.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => ChallengeModule),
    CommitModule,
    forwardRef(() => UserModule),
    NotificationModule,
  ],
  controllers: [ViewController],
  providers: [HomeViewService],
  exports: [HomeViewService],
})
export class ViewModule {}
