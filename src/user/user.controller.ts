import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateUserPayload } from './dto/user.dto';

@Controller()
export class UserController {
  constructor(private readonly user: UserService) { }

  @Post('/user')
  @ApiOperation({ description: '유저를 생성합니다.' })
  async createUser(): Promise<any> {
    const user = await this.user.createUser();
    return {
      userNo: user.userNo
    };
  }

  @Patch('/user')
  @ApiOperation({ description: '유저 정보를 수정합니다.' })
  async updateUser(@Body() updateUserPayload: UpdateUserPayload): Promise<any> {
    const user = await this.user.updateUser(updateUserPayload);
    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo
    };
  }

  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.' })
  async me(req: any): Promise<any> {
    const user = await this.user.me(req.user.userNo);
    return {
      userNo: user.userNo,
      nicknae: user.nickname,
      partnerNo: user.partnerNo
    };
  }
}
