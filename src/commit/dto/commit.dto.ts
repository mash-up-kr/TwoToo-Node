import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { IsString } from 'class-validator';

export class CommitResponse {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '인증 번호',
    required: true,
  })
  commitNo: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '인증하는 사용자의 번호',
    required: true,
  })
  userNo: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
  })
  text: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
  })
  photoUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '꾸준히 하는 모습 칭찬해',
    description: '상대방이 남길 칭찬 문구',
  })
  partnerComment: string;
}

export class CommitCreatePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
  })
  text: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
  })
  photoUrl: string;

  @ApiProperty({ description: '생성 시각' })
  createdAt: number;

  @ApiProperty({ description: '수정 시각' })
  updatedAt: number;
}

export class CommitCommentPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '꾸준히 하는 모습 칭찬해',
    description: '상대방이 남길 칭찬 문구',
  })
  partnerComment: string;
}
