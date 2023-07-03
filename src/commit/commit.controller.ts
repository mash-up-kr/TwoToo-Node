import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommitCommentPayload, CommitPayload, CommitResDto } from './dto/commit.dto';
import { CommitService } from './commit.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtParam } from '../auth/auth.user.decorator';
import { JwtPayload } from '../auth/auth.types';

@ApiTags('commit')
@Controller('commit')
export class CommitController {
  constructor(private readonly commitSvc: CommitService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지 인증을 진행합니다.', summary: '챌린지 인증' })
  @ApiResponse({ status: 200, type: CommitResDto })
  async createCommit(
    @Body() data: CommitPayload,
    @JwtParam() jwtparam: JwtPayload,
  ): Promise<CommitResDto> {
    const commit = await this.commitSvc.createCommit({ userNo: jwtparam.userNo, data });
    return commit;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/:commitNo')
  @ApiOperation({ description: '챌린지 인증 정보를 조회합니다.', summary: '챌린지 인증 조회' })
  @ApiResponse({ status: 200, type: CommitResDto })
  async getCommit(@Param('commitNo') commitNo: string): Promise<CommitResDto> {
    const commit = await this.commitSvc.getCommit(parseInt(commitNo));
    return commit;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/:commitNo/comment')
  @ApiOperation({
    description: '파트너의 챌린지 인증에 칭찬 댓글을 추가합니다.',
    summary: '칭찬하기'
  })
  @ApiResponse({ status: 200, type: CommitResDto })
  async createComment(
    @Body() data: CommitCommentPayload,
    @Param('commitNo') commitNo: string,
  ): Promise<CommitResDto> {
    const commit = await this.commitSvc.updateCommit({
      commitNo: parseInt(commitNo),
      partnerComment: data.partnerComment,
    });

    return commit;
  }
}
