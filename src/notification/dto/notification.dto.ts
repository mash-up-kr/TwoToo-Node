import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PushPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
    required: true,
  })
  message!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCMTOKEN',
    description: 'FCM Device Token',
    required: true,
  })
  deviceToken!: string;
}

export class StingPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
    required: true,
  })
  message!: string;
}
export class PushResDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCMTOKEN',
    description: 'FCM Device Token',
    required: true,
  })
  deviceToken!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
    required: true,
  })
  message!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'TwoToo',
    description: 'Push 알림 전송 주체',
    required: true,
  })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
    required: true,
  })
  nickname!: string;
}

export class NotificationResDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '사용자 번호',
    required: true,
  })
  userNo!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
    required: true,
  })
  message!: string;
}
