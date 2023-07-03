import { Module } from '@nestjs/common';
import { ViewController } from './view.controller';
import { UserModule } from '../user/user.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { CommitModule } from '../commit/commit.module';
import { HomeViewService } from './homeView.service';

@Module({
  imports: [UserModule, ChallengeModule, CommitModule],
  controllers: [ViewController],
  providers: [HomeViewService],
})
export class ViewModule {}
