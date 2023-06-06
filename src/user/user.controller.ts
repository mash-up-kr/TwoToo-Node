import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetNicknamePayload } from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) { }

  @Post('/signup')
  @ApiOperation({ description: '회원가입을 진행합니다.' })
  async signUp(): Promise<any> {
    const [user, accessToken] = await this.user.signUp();

    return {
      accessToken,
      userId: user._id,
    }
  }

  // TODO: AuthGuard
  @Post('/signin')
  @ApiOperation({ description: '로그인을 진행합니다.' })
  async signIn(@Req() req: any): Promise<any> {
    const user = await this.user.signIn(req.user._id);

    return {
      state: this.user.checkCurrentLoginState(req.user._id),
      ...user,
    }
  }

  @Patch('/nickname')
  @ApiOperation({ description: '유저의 닉네임을 설정합니다. 초대를 받은 유저는 매칭도 진행합니다.' })
  async setNickname(@Req() req: any, @Body() data: SetNicknamePayload): Promise<any> {
    const updatedUser = await this.user.setNickname({ userId: req.user._id, data });

    return {
      user: updatedUser
    }
  }

  @Get('/partner')
  @ApiOperation({ description: '투투메이트 매칭 상태를 확인합니다.' })
  async checkPartner(@Req() req: any): Promise<any> {
    const partnerId = await this.user.checkPartner(req.user._id)

    return {
      partnerId: partnerId,
    }
  }

  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.' })
  async me(@Req() req: any): Promise<any> {
    const user = await this.user.me(req.user._id);
    return { user: user };
  }
}
