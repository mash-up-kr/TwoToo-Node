import { Commit } from '../../commit/schema/commit.schema';
import { User } from '../../user/schema/user.schema';
import { Challenge } from '../../challenge/schema/challenge.schema';

export class HomeViewResDto {
  viewState: string;
  user1: User; // 챌린지 생성자
  user2: User; // 챌린지 수락자
  challengeTotal: number; // 전체 진행한 챌린지 횟수
  challenge: Challenge | null; // 현재 진행중인 챌린지 정보
  user1Commit: Commit | null; // 오늘 인증 정보
  user2Commit: Commit | null;
}
