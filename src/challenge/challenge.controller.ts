import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { JwtParam } from '../auth/auth.user.decorator';
import { ChallengeService } from './challenge.service';
import { FindChallengeResDto } from './dto/find-challenge.res.dto';
import {
  AcceptChallengePayload,
  ChallengeResDto,
  CreateChallenge,
  CreateChallengePayload,
  ChallengeHistoryResDto,
} from './dto/challenge.dto';

@ApiTags('challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(
    private readonly userSvc: UserService,
    private readonly challengeSvc: ChallengeService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('histories')
  @ApiOperation({ description: '히스토리 목록을 조회합니다.', summary: '히스토리 화면 조회' })
  @ApiResponse({ status: 200, type: [ChallengeHistoryResDto] })
  async getHistories(@JwtParam() JwtParam: JwtPayload): Promise<ChallengeHistoryResDto[]> {
    const userNo = JwtParam.userNo;
    return await this.challengeSvc.getChallengeHistories({ userNo });
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
      user1No: user.userNo,
      user2Flower: data.user2Flower,
      // TODO: 날짜 정책 정하기
      startDate: new Date(),
    };
    const challenge = await this.challengeSvc.createChallenge(challengeInfo);
    return challenge;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':challengeNo')
  @ApiOperation({ description: '특정 챌린지를 조회합니다.', summary: '챌린지 조회' })
  @ApiResponse({ status: 200, type: ChallengeResDto })
  async findChallenge(@Param('challengeNo') challengeNo: number): Promise<FindChallengeResDto> {
    const challenge = await this.challengeSvc.findChallenge(challengeNo);
    return challenge;
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
  ): Promise<ChallengeResDto> {
    const challenge = await this.challengeSvc.acceptChallenge(challengeNo, data.user1Flower);
    return challenge;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':challengeNo')
  @ApiOperation({ description: '챌린지를 삭제합니다.', summary: '챌린지 그만두기' })
  @ApiResponse({ status: 200, type: Number })
  async deleteChallenge(@Param('challengeNo') challengeNo: number): Promise<number> {
    return this.challengeSvc.deleteChallenge(challengeNo);
  }
}
