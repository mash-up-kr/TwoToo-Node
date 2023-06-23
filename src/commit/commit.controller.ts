import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommitCommentPayload, CommitCreatePayload, CommitResponse } from './dto/commit.dto';
import { CommitService } from './commit.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { JwtPayload } from 'src/auth/auth.types';

@ApiTags('commit')
@Controller('commit')
export class CommitController {
  constructor(private readonly commitSvc: CommitService) {}

  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({ description: '챌린지 인증을 진행합니다.' })
  async createCommit(
    @Body() data: CommitCreatePayload,
    @JwtParam() jwtparam: JwtPayload,
  ): Promise<CommitResponse> {
    const commit = await this.commitSvc.createCommit({ userNo: jwtparam.userNo, data });

    return commit;
  }

  @UseGuards(AuthGuard)
  @Get('/:commitNo')
  @ApiOperation({ description: '챌린지 인증 정보를 조회합니다.' })
  async getCommit(@Param('commitNo') commitNo: string): Promise<CommitResponse> {
    const commit = await this.commitSvc.getCommit(parseInt(commitNo));

    return commit;
  }

  @UseGuards(AuthGuard)
  @Post('/:commitNo/comment')
  @ApiOperation({ description: '파트너의 챌린지 인증에 칭찬 댓글을 추가합니다.' })
  async createComment(
    @Req() req: any,
    @Body() { partnerComment }: CommitCommentPayload,
    @Param('commitNo') commitNo: string,
  ): Promise<CommitResponse> {
    const commit = await this.commitSvc.updateCommit({
      commitNo: parseInt(commitNo),
      partnerComment,
    });

    return commit;
  }
}
