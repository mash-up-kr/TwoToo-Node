import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChallengeService } from './challenge.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtParam } from '../auth/auth.user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { CreateChallengeReqDto } from './dto/create-challenge.req.dto';
import { FindChallengeResDto, FindChallengeResDtoMapper } from './dto/find-challenge.res.dto';

@ApiTags('challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(
    private readonly challengeSvc: ChallengeService,
    private readonly userSvc: UserService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지를 생성합니다.', summary: '챌린지 생성' })
  // TODO: Validation 필요
  // TODO: CRUD 할 때, 자신의 챌린지 아니면 예외 처리 하는 로직 필요한지 고민.
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':challengeNo')
  @ApiOperation({ description: '특정 챌린지를 조회합니다.', summary: '챌린지 조회' })
  async findChallenge(@Param('challengeNo') challengeNo: number): Promise<FindChallengeResDto> {
    const challenge = await this.challengeSvc.findChallenge(challengeNo);
    return FindChallengeResDtoMapper.toDto(challenge);
  }
 
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({ description: '유저의 모든 챌린지를 조회합니다.', summary: '챌린지 모두 조회' })
  async findUserChallenges(
    @JwtParam() jwtPayload: JwtPayload,
  ): Promise<FindChallengeResDtoMapper[]> {
    const userNo = jwtPayload.userNo;
    const challenges = await this.challengeSvc.findUserChallenges(userNo);
    return challenges.map((challenge) => FindChallengeResDtoMapper.toDto(challenge));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':challengeNo/approve')
  @ApiOperation({ description: '챌린지를 수락합니다.', summary: '챌린지 수락' })
  async acceptChallenge(
    @Param('challengeNo') challengeNo: number,
    @Body() body: { user1Flower: string },
  ): Promise<FindChallengeResDtoMapper> {
    const challenge = await this.challengeSvc.approveChallenge(challengeNo, body.user1Flower);
    return FindChallengeResDtoMapper.toDto(challenge);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':challengeNo')
  @ApiOperation({ description: '챌린지를 삭제합니다.', summary: '챌린지 그만두기' })
  async deleteChallenge(@Param('challengeNo') challengeNo: number): Promise<number> {
    return this.challengeSvc.deleteChallenge(challengeNo);
  }
}
