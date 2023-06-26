import { Controller, Get, UseGuards } from '@nestjs/common';
import { CommitService } from '../commit/commit.service';
import { UserService } from '../user/user.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HomeViewResDto } from './dto/home-view.res.dto';

@Controller('view')
export class ViewController {
  constructor(
    private readonly challengeSvc: ChallengeService,
    private readonly userSvc: UserService,
    private readonly commitSvc: CommitService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('home')
  @ApiOperation({ description: '홈 화면을 조회합니다.' })
  async getHomeView(): Promise<HomeViewResDto> {
    return new HomeViewResDto();
  }
}
