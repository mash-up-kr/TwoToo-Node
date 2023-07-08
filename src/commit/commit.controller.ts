import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CommitService } from './commit.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { JwtParam } from '../auth/auth.user.decorator';
import { CommitCommentPayload, CommitPayload, CommitResDto } from './dto/commit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './s3.service';

@ApiTags('commit')
@Controller('commit')
export class CommitController {
  constructor(
    private readonly commitSvc: CommitService,
    private readonly fileService: FileService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        img: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ description: '챌린지 인증을 진행합니다.', summary: '챌린지 인증' })
  @ApiResponse({ status: 200, type: CommitResDto })
  @UseInterceptors(FileInterceptor('img')) // img가 key인 file 처리
  async createCommit(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() data: CommitPayload,
    @JwtParam() jwtparam: JwtPayload,
  ) {
    this.fileService.validateFile(file);

    data.photoUrl = file.location;
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
    description: '파트너의 챌린지 인증에 칭찬 문구를 추가합니다.',
    summary: '칭찬하기',
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
