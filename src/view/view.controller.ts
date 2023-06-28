import { Controller, Get, UseGuards } from '@nestjs/common';
import { CommitService } from '../commit/commit.service';
import { UserService } from '../user/user.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HomeViewResDto } from './dto/home-view.res.dto';
import { HomeViewService } from './homeView.service';
import { JwtParam } from '../auth/auth.user.decorator';
import { JwtPayload } from '../auth/auth.types';

@Controller('view')
export class ViewController {
  constructor(
    private readonly challengeSvc: ChallengeService,
    private readonly userSvc: UserService,
    private readonly commitSvc: CommitService,
    private readonly homeViewSvc: HomeViewService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('home')
  @ApiOperation({ description: '홈 화면을 조회합니다.' })
  async getHomeView(@JwtParam() jwtParam: JwtPayload): Promise<HomeViewResDto> {
    return await this.homeViewSvc.createHomeViewResponse(jwtParam.userNo);
  }
}
