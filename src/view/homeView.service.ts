import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChallengeService } from '../challenge/challenge.service';
import { CommitService } from '../commit/commit.service';
import { HomeViewState, HomeViewStateType } from './view.type';
import { ChallengeDocument } from '../challenge/schema/challenge.schema';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class HomeViewService {
  constructor(
    private readonly userSvc: UserService,
    private readonly challengeSvc: ChallengeService,
    private readonly commitSvc: CommitService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getHomeViewState(recentChallenge: ChallengeDocument | null, userNo: number): HomeViewStateType {
    const currentDate = new Date();
    // 가장 최근게 완료된거면 아직 생성 전
    if (recentChallenge === null || recentChallenge.isFinished) return HomeViewState.BEFORE_CREATE;

    const { startDate, endDate, isApproved, user1, user2 } = recentChallenge;
    if (!isApproved) {
      // When Not Approved
      const approveDeadLine = endOfDay(startDate);
      if (approveDeadLine < currentDate) return HomeViewState.EXPIRED_BY_NOT_APPROVED;
      if (userNo === user1.userNo) return HomeViewState.BEFORE_PARTNER_APPROVE;
      if (userNo === user2.userNo) return HomeViewState.BEFORE_MY_APPROVE;
    } else {
      // When Approved
      const challengeStartLine = startOfDay(startDate);
      if (currentDate < challengeStartLine) return HomeViewState.APPROVED_BUT_BEFORE_START_DATE;
      const challengeEndLine = endOfDay(endDate);
      if (challengeEndLine < currentDate) return HomeViewState.COMPLETE;
      return HomeViewState.IN_PROGRESS;
    }
  }
}
