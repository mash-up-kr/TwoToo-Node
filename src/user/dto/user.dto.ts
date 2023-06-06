import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IsString } from "class-validator";

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ngI0v2YUJ9e2UPfBFjlKriIZvXvOGKfgh59hda0v....',
    description: 'Access Token',
    required: true,
  })
  accessToken: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '647eee4bdbd1ddadf03b0279',
    description: '사용자 ID',
    required: true,
  })
  userId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
  })
  nickname: string;

  @IsNumber()
  @ApiProperty({
    example: '647eee4bdbd1ddadf03b0270',
    description: '파트너 ID',
  })
  parterId: number;
}

export class SetNicknamePayload {
  @IsString()
  @ApiProperty({
    example: '왕자',
    description: '사용할 닉네임',
    required: true,
  })
  nickname: string;

  @IsNumber()
  @ApiProperty({
    example: '647eee4bdbd1ddadf03b0279',
    description: '파트너 ID',
  })
  partnerId: string;
}
