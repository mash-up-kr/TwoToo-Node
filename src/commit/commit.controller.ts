import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommitCommentDto, CommitResponse } from './dto/commit.dto';
import { CommitService } from './commit.service';

@ApiTags('commit')
@Controller('commit')
export class CommitController {
  constructor(private readonly commit: CommitService) { }

  // @TODO AuthGaurd
  @Post('/commit')
  @ApiOperation({ description: '챌린지 인증을 진행합니다.' })
  async createCommit(@Body() commitPayload: any): Promise<CommitResponse> {
    const commit = await this.commit.createCommit(commitPayload);

    return commit;
  }

  // @TODO AuthGaurd
  @Get('/commit/:commitNo')
  @ApiOperation({ description: '챌린지 인증 정보를 조회합니다.' })
  async getCommit(
    @Req() req: any,
    @Param('commitNo') commitNo: string
  ): Promise<CommitResponse> {
    const commit = await this.commit.getCommit(parseInt(commitNo));

    return commit;
  }

  // @TODO AuthGaurd
  @Post('/commit/:commitNo/comment')
  @ApiOperation({ description: '파트너의 챌린지 인증에 칭찬 댓글을 추가합니다.' })
  async createComment(
    @Req() req: any,
    @Body() { partnerComment }: CommitCommentDto,
    @Param('commitNo') commitNo: string,
  ): Promise<CommitResponse> {
    const commit = await this.commit.updateCommit({ commitNo: parseInt(commitNo), partnerComment });

    return commit;
  }
}
