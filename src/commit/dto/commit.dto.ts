import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { IsString } from 'class-validator';

export class CommitResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '인증 번호',
    required: true,
  })
  commitNo!: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '인증하는 사용자의 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
  })
  text!: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
  })
  photoUrl!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '꾸준히 하는 모습 칭찬해',
    description: '상대방이 남길 칭찬 문구',
  })
  partnerComment: string;
}

export class CommitPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '오늘도 7시 기상 완료',
    description: '인증에 남길 설명',
  })
  text!: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: '인증 사진 업로드 주소',
  })
  photoUrl!: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(),
    description: '생성 시각'
  })
  createdAt!: number;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    default: new Date(),
    description: '수정 시각'
  })
  updatedAt!: number;
}

export class CommitCommentPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '꾸준히 하는 모습 칭찬해',
    description: '상대방이 남길 칭찬 문구',
  })
  partnerComment!: string;
}
