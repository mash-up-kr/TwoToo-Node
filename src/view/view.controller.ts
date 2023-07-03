import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HomeViewResDto } from './dto/home-view.dto';
import { HomeViewService } from './homeView.service';
import { JwtParam } from '../auth/auth.user.decorator';
import { JwtPayload } from '../auth/auth.types';

@ApiTags('view')
@Controller('view')
export class ViewController {
  constructor(private readonly homeViewSvc: HomeViewService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('home')
  @ApiOperation({ description: '홈 화면을 조회합니다.', summary: '홈 화면 조회' })
  @ApiResponse({ status: 200, type: HomeViewResDto })
  async getHomeView(@JwtParam() jwtParam: JwtPayload): Promise<HomeViewResDto> {
    return await this.homeViewSvc.createHomeViewResponse(jwtParam.userNo);
  }
}
