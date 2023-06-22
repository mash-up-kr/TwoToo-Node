import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ChallengeService } from './challenge.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtParam } from '../auth/auth.user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { CreateChallengeReqDto } from './dto/create-challenge.req.dto';

@Controller('challenge')
export class ChallengeController {
  constructor(
    private readonly challengeSvc: ChallengeService,
    private readonly userSvc: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지를 생성합니다.' })
  // TODO: Validation 필요
  async createChallenge(
    @Body() body: CreateChallengeReqDto,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<any> {
    const user = await this.userSvc.getUser(jwtParam.userNo);
    const createChallengeDto: CreateChallengeDto = {
      name: body.name,
      user1No: user.userNo,
      user2Flower: body.user2Flower,
      // TODO: 날짜 정책 정하기
      startDate: new Date(),
    };
    const challenge = await this.challengeSvc.createChallenge(createChallengeDto);
    return challenge;
  }

  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지를 시작합니다.' })
  async startChallenge(): Promise<any> {
    return null;
  }

  @UseGuards(AuthGuard)
  @Get(':challengeNo')
  @ApiOperation({ description: '특정 챌린지를 조회합니다.' })
  async findChallenge(@Param('challengeNo') challengeNo: number): Promise<any> {
    return null;
  }

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({ description: '유저의 모든 챌린지를 조회합니다.' })
  async findUserChallenges(): Promise<any> {
    return null;
  }

  @UseGuards(AuthGuard)
  @Post(':challengeNo/accept')
  @ApiOperation({ description: '챌린지를 수락합니다.' })
  async acceptChallenge(@Param('challengeNo') challengeNo: number): Promise<any> {
    return null;
  }

  @UseGuards(AuthGuard)
  @Delete(':challengeNo')
  @ApiOperation({ description: '챌린지를 삭제합니다.' })
  async deleteChallenge(): Promise<any> {
    return null;
  }
}
