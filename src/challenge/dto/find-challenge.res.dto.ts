import { User } from '../../user/schema/user.schema';
import { ChallengeDocument } from '../schema/challenge.schema';

export class FindChallengeResDto {
  challengeNo: number;
  name: string;
  description: string;
  user1: User; // 챌린지 생성자
  user2: User; // 챌린지 수락자
  startDate: Date;
  endDate: Date;
  user1CommitCnt: number;
  user2CommitCnt: number;
  user1Flower: string;
  user2Flower: string;
  isApproved: boolean;
  isFinished: boolean;
}

export class FindChallengeResDtoMapper {
  static toDto(challenge: ChallengeDocument): FindChallengeResDto {
    const dto: FindChallengeResDto = {
      challengeNo: challenge.challengeNo,
      name: challenge.name,
      description: challenge.description,
      user1: challenge.user1,
      user2: challenge.user2,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      user1CommitCnt: challenge.user1CommitCnt,
      user2CommitCnt: challenge.user2CommitCnt,
      user1Flower: challenge.user1Flower,
      user2Flower: challenge.user2Flower,
      isApproved: challenge.isApproved,
      isFinished: challenge.isFinished,
    };
    return dto;
  }
}
