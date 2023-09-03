import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { endOfDay, startOfDay } from 'date-fns';
import * as _ from 'lodash';

import { HomeViewResDto } from './dto/home-view.dto';
import { HomeViewState, HomeViewStateType } from './view.type';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeDocument } from '../challenge/schema/challenge.schema';
import { CommitService } from '../commit/commit.service';
import { CommitDocument } from '../commit/schema/commit.schema';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schema/user.schema';

@Injectable()
export class HomeViewService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userSvc: UserService,
    @Inject(forwardRef(() => ChallengeService))
    private readonly challengeSvc: ChallengeService,
    private readonly commitSvc: CommitService,
    private readonly notificationSvc: NotificationService,
  ) {}

  async createHomeViewResponse(userNo: number): Promise<HomeViewResDto> {
    const recentChallenge = await this.challengeSvc.findRecentChallenge(userNo);
    const myInfo: UserDocument = await this.userSvc.getUser(userNo);
    let myCommit: CommitDocument | null = null;

    if (_.isNull(myInfo.partnerNo)) {
      throw new BadRequestException('파트너 매칭이 완료되지 않았습니다.');
    }

    const partnerInfo: UserDocument = await this.userSvc.getUser(myInfo.partnerNo as number);
    let partnerCommit: CommitDocument | null = null;
    let myStingCnt = 0;

    if (!_.isNull(recentChallenge)) {
      myCommit = await this.commitSvc.getTodayCommit(myInfo.userNo, recentChallenge.challengeNo);
      partnerCommit = await this.commitSvc.getTodayCommit(
        partnerInfo.userNo,
        recentChallenge.challengeNo,
      );
      myStingCnt = await this.notificationSvc.getStingCount(userNo);
    }

    return {
      viewState: this.getHomeViewState(recentChallenge, userNo),
      challengeTotal: await this.challengeSvc.countUserChallenges(userNo),
      onGoingChallenge: recentChallenge?.isDeleted ? null : recentChallenge,
      myInfo: this.userSvc.getPartialUserInfo(myInfo),
      myCommit,
      partnerInfo: this.userSvc.getPartialUserInfo(partnerInfo),
      partnerCommit,
      myStingCnt,
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getHomeViewState(recentChallenge: ChallengeDocument | null, userNo: number): HomeViewStateType {
    const currentDate = new Date();
    // 생성 가능
    // 생성 전, 최근 챌린지 완료, 최근 챌린지 삭제
    if (recentChallenge === null || recentChallenge.isFinished || recentChallenge.isDeleted)
      return HomeViewState.BEFORE_CREATE;

    const { startDate, endDate, isApproved, user1, user2 } = recentChallenge;
    if (!isApproved) {
      // 수락 전
      const approveDeadLine = endOfDay(startDate);
      if (approveDeadLine < currentDate) return HomeViewState.EXPIRED_BY_NOT_APPROVED;
      if (userNo === user1.userNo) return HomeViewState.BEFORE_PARTNER_APPROVE;
      if (userNo === user2.userNo) return HomeViewState.BEFORE_MY_APPROVE;
    } else {
      // 수락 완료
      const challengeStartLine = startOfDay(startDate);
      if (currentDate < challengeStartLine) return HomeViewState.APPROVED_BUT_BEFORE_START_DATE;
      const challengeEndLine = endOfDay(endDate);
      if (challengeEndLine < currentDate) return HomeViewState.COMPLETE;
      return HomeViewState.IN_PROGRESS;
    }
  }
}
