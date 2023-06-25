import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PushPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
  })
  message!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'FCMTOKEN',
    description: 'FCM Device Token',
  })
  deviceToken!: string;
}

export class StingPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '왜 인증 안해!?!',
    description: 'Push 메세지',
  })
  message!: string;
}
