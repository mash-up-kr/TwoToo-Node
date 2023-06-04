import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { IsString } from "class-validator";

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '카카오',
    description: 'OAuth 제공자 이름',
    required: true,
  })
  authProvider: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ngI0v2YUJ9e2UPfBFjlKriIZvXvOGKfgh59hda0v....',
    description: 'OAuth 제공자의 Access Token',
    required: true,
  })
  accessToken: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '사용자 ID',
    required: true,
  })
  userNo: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '공주',
    description: '사용할 닉네임',
  })
  nickname: string;

  @IsNumber()
  @ApiProperty({
    example: 'bdc350a8-dd91-4a5d-acd3-8a6e4679f11d',
    description: '파트너 ID',
  })
  parterNo: number;

}

export class UpdateUserPayload {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '사용자 No',
    required: true,
  })
  userNo: number;

  @IsString()
  @ApiProperty({
    example: '왕자',
    description: '사용할 닉네임'
  })
  nickname: string;

  @IsNumber()
  @ApiProperty({
    example: 2,
    description: '파트너 No',
  })
  partnerNo: number;
}