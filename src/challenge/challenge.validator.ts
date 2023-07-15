import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';

@Injectable()
export class ChallengeValidator {
  constructor(private readonly challengeSvc: ChallengeService) {}

  async validateChallengeAccessible(userNo: number, challengeNo: number) {
    const challenge = await this.challengeSvc.findChallenge(challengeNo);
    if (!challenge) throw new NotFoundException('존재하지 않는 챌린지입니다.');
    if (challenge.user1.userNo !== userNo && challenge.user2.userNo !== userNo) {
      throw new UnauthorizedException('해당 챌린지에 접근할 수 있는 유저가 아닙니다.');
    }
  }

  async validateChallengeYetApproved(challengeNo: number) {
    const challenge = await this.challengeSvc.findChallenge(challengeNo);
    if (challenge.isApproved) throw new ConflictException('이미 수락된 챌린지입니다.');
  }
}
