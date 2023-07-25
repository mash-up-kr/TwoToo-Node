import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CommitResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '인증 번호',
    required: true,
  })
  commitNo!: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '인증하는 사용자의 번호',
    required: true,
  })
  userNo!: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '챌린지 번호',
    required: true,
  })
  challengeNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
    required: true,
  })
  text!: string;

  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
    required: true,
  })
  photoUrl!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '꾸준히 하는 모습 칭찬해',
    description: '상대방이 남길 칭찬 문구',
    required: true,
  })
  partnerComment: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '2023-07-25T05:54:50.431Z',
    description: '상대방이 칭찬한 시간',
    required: true,
  })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({
    example: '2023-07-25T05:54:50.431Z',
    description: '상대방이 칭찬한 시간',
    required: true,
  })
  updatedAt: Date;
}

export class CommitPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
    required: true,
  })
  text!: string;

  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
    required: true,
  })
  photoUrl!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '챌린지 번호',
    required: true,
  })
  challengeNo!: number;
}

export class CommitCommentPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 인증하느라 고생했어!',
    description: '파트너의 챌린지 인증에 남길 칭찬 문구',
    required: true,
  })
  comment!: string;
}
