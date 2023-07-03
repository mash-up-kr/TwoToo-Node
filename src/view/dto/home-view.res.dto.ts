import { Commit } from '../../commit/schema/commit.schema';
import { Challenge } from '../../challenge/schema/challenge.schema';
import { HomeViewStateType } from '../view.type';

export class HomeViewResDto {
  viewState: HomeViewStateType;
  challengeTotal: number; // 전체 진행한 챌린지 횟수
  onGoingChallenge: Challenge | null; // 현재 진행중인 챌린지 정보
  user1Commit: Commit | null; // 오늘 인증 정보
  user2Commit: Commit | null;
}
