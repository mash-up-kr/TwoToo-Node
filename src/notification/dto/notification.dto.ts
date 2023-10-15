import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum NotificaitonType {
  CHALLENGE_CREATE = 'challengeCreate',
  CHALLENGE_APPROVE = 'challengeApprove',
  COMMIT = 'commit',
  STING = 'sting',
}

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
    example: '공주',
    description: '사용할 닉네임',
    required: true,
  })
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'challengeCreate',
    enum: NotificaitonType,
    description: 'Notification Type',
    required: true,
  })
  notificationType: NotificaitonType;
}

export class CommitPushResDto {
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
    example: '공주',
    description: '사용할 닉네임',
    required: true,
  })
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'challengeCreate',
    enum: NotificaitonType,
    description: 'Notification Type',
    required: true,
  })
  notificationType: NotificaitonType;

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
    description: '인증 번호',
    required: true,
  })
  challengeNo!: number;
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
