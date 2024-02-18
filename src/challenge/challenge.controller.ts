import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { JwtParam } from '../auth/auth.user.decorator';
import { ChallengeService } from './challenge.service';
import {
  AcceptChallengePayload,
  ChallengeResDto,
  CreateChallenge,
  CreateChallengePayload,
  ChallengeAndCommitListResDto,
  UpdateChallengePayload,
  ChallengeHistoryResDto,
  GrowthDiaryResDto,
} from './dto/challenge.dto';
import { ChallengeValidator } from './challenge.validator';
import { CommitService } from 'src/commit/commit.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificaitonType } from 'src/notification/dto/notification.dto';
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(
    private readonly userSvc: UserService,
    private readonly challengeValidator: ChallengeValidator,
    private readonly challengeSvc: ChallengeService,
    private readonly commitSvc: CommitService,
    private readonly notificationSvc: NotificationService,
    private readonly loggerSvc: LoggerService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('histories')
  @ApiOperation({ description: '히스토리 목록을 조회합니다.', summary: '히스토리 화면 조회' })
  @ApiResponse({ status: 200, type: [ChallengeHistoryResDto] })
  async getHistories(@JwtParam() JwtParam: JwtPayload): Promise<ChallengeHistoryResDto[] | []> {
    const userNo = JwtParam.userNo;
    const challengeHistory = await this.challengeSvc.getChallengeHistory({ userNo });

    return challengeHistory;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지를 생성합니다.', summary: '챌린지 생성' })
  @ApiResponse({ status: 200, type: ChallengeResDto })
  // TODO: Validation 필요
  // TODO: CRUD 할 때, 자신의 챌린지 아니면 예외 처리 하는 로직 필요한지 고민.
  async createChallenge(
    @Body() data: CreateChallengePayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<ChallengeResDto> {
    const user = await this.userSvc.getUser(jwtParam.userNo);

    const challengeInfo: CreateChallenge = {
      name: data.name,
      description: data.description,
      user1: user,
      user2Flower: data.user2Flower,
      startDate: new Date(data.startDate),
    };
    const challenge = await this.challengeSvc.createChallenge(challengeInfo);

    const partnerDeviceToken = await this.userSvc.getPartnerDeviceToken(jwtParam.userNo);
    const message = '짝꿍이 챌린지를 만들었어요! 확인해볼까요?';

    let pushRet;
    try {
      pushRet = await this.notificationSvc.sendPush({
        nickname: user.nickname,
        message,
        deviceToken: partnerDeviceToken,
        notificationType: NotificaitonType.CHALLENGE_CREATE,
      });
    } catch (e) {
      this.loggerSvc.error(`${jwtParam.userNo} PushError` + e);
      return challenge;
    }

    if (pushRet) {
      await this.notificationSvc.createSting({
        message,
        userNo: jwtParam.userNo,
        notificationType: NotificaitonType.CHALLENGE_CREATE,
      });
    } else {
      this.loggerSvc.error('NO Push Return');
    }

    return challenge;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':challengeNo')
  @ApiOperation({ description: '특정 챌린지를 조회합니다.', summary: '챌린지 조회' })
  @ApiResponse({ status: 200, type: ChallengeAndCommitListResDto })
  async findChallenge(
    @Param('challengeNo') challengeNo: number,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<ChallengeAndCommitListResDto> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);
    const challenge = await this.challengeSvc.findChallenge(challengeNo);
    const user1CommitList = await this.commitSvc.getCommitList(challengeNo, challenge.user1.userNo);
    const user2CommitList = await this.commitSvc.getCommitList(challengeNo, challenge.user2.userNo);

    return {
      ...challenge,
      user1CommitList,
      user2CommitList,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({ description: '유저의 모든 챌린지를 조회합니다.', summary: '챌린지 모두 조회' })
  @ApiResponse({ status: 200, type: [ChallengeResDto] })
  async findUserChallenges(@JwtParam() jwtPayload: JwtPayload): Promise<ChallengeResDto[]> {
    const userNo = jwtPayload.userNo;
    const challenges = await this.challengeSvc.findUserChallenges(userNo);
    return challenges;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':challengeNo/approve')
  @ApiOperation({ description: '챌린지를 수락합니다.', summary: '챌린지 수락' })
  @ApiResponse({ status: 200, type: ChallengeResDto })
  async acceptChallenge(
    @Param('challengeNo') challengeNo: number,
    @Body() data: AcceptChallengePayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<ChallengeResDto> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);
    await this.challengeValidator.validateChallengeYetApproved(challengeNo);

    const challenge = await this.challengeSvc.acceptChallenge(challengeNo, data.user1Flower);

    const partnerDeviceToken = await this.userSvc.getPartnerDeviceToken(jwtParam.userNo);
    const message = '짝꿍이 챌린지를 수락했어요! 이제 인증해볼까요?';

    let pushRet;
    try {
      pushRet = await this.notificationSvc.sendPush({
        nickname: challenge.user2.nickname,
        message,
        deviceToken: partnerDeviceToken,
        notificationType: NotificaitonType.CHALLENGE_APPROVE,
      });
    } catch (e) {
      this.loggerSvc.error(`${jwtParam.userNo} PushError` + e);
      return challenge;
    }

    if (pushRet) {
      await this.notificationSvc.createSting({
        message,
        userNo: jwtParam.userNo,
        notificationType: NotificaitonType.CHALLENGE_APPROVE,
      });
    } else {
      this.loggerSvc.error('NO Push Return');
    }

    return challenge;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':challengeNo')
  @ApiOperation({
    description: '챌린지를 수정합니다. 수정 할 필드 값만 인자로 전달합니다.',
    summary: '챌린지 수정하기',
  })
  @ApiResponse({ status: 200, type: ChallengeResDto })
  async updateChallenge(
    @Param('challengeNo') challengeNo: number,
    @Body() data: UpdateChallengePayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<ChallengeResDto> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);

    return this.challengeSvc.updateChallenge(challengeNo, data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':challengeNo')
  @ApiOperation({ description: '챌린지를 삭제합니다.', summary: '챌린지 그만두기' })
  @ApiResponse({ status: 200, type: Number })
  async deleteChallenge(
    @Param('challengeNo') challengeNo: number,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<number> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);

    return this.challengeSvc.deleteChallenge(challengeNo);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':challengeNo/finish')
  @ApiOperation({ description: '챌린지를 완료합니다.', summary: '챌린지 완료' })
  @ApiResponse({ status: 200, type: ChallengeResDto })
  async finishChallenge(
    @Param('challengeNo') challengeNo: number,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<ChallengeResDto> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);
    await this.challengeValidator.validateChallengeYetFinished(challengeNo);
    //TODO: 챌린지 종료일이 지났을 때 종료 가능 validate

    return this.challengeSvc.finishChallenge(challengeNo);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':challengeNo/growthDiary')
  @ApiOperation({ description: '성장일지 정보를 얻습니다.', summary: '성장일지 정보 얻기' })
  @ApiResponse({ status: 200, type: GrowthDiaryResDto })
  async getGrowthDiary(
    @Param('challengeNo') challengeNo: number,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<GrowthDiaryResDto> {
    await this.challengeValidator.validateChallengeAccessible(jwtParam.userNo, challengeNo);
    await this.challengeValidator.validateChallengeYetFinished(challengeNo);
    const user = await this.userSvc.getUser(jwtParam.userNo);
    const challenge = await this.challengeSvc.findChallenge(challengeNo);

    challenge.startDate.setHours(challenge.startDate.getHours() + 9);
    if (!user.partnerNo) {
      throw Error('매칭이 되지 않았습니다.');
    }
    const partner = await this.userSvc.getUser(user.partnerNo);
    const myGrowthDiaryData = await this.challengeSvc.getUserGrowthDiaryData({
      userNo: jwtParam.userNo,
      challengeNo,
      startDate: challenge.startDate,
    });

    const partnerGrowthDiaryData = await this.challengeSvc.getUserGrowthDiaryData({
      userNo: user.partnerNo,
      challengeNo,
      startDate: challenge.startDate,
    });

    return {
      challengeStartDate: challenge.startDate,
      challengeEndDate: challenge.endDate,
      challengeName: challenge.name,
      my: {
        nickname: user.nickname,
        ...myGrowthDiaryData,
      },
      partner: {
        nickname: partner.nickname,
        ...partnerGrowthDiaryData,
      },
    };
  }
}
