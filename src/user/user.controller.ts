import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetNicknameAndPartnerPayload, SignInResult, SignUpResult, UserInfoResponse, signInPayload } from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) { }

  @Post('/signup')
  @ApiOperation({ description: '회원가입을 진행합니다.' })
  async signUp(): Promise<SignUpResult> {
    const [user, accessToken] = await this.user.signUp();

    return {
      accessToken,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo
    }
  }

  // TODO: AuthGuard
  @Post('/signin')
  @ApiOperation({ description: '로그인을 진행합니다.' })
  async signIn(@Body() signInPayload: signInPayload): Promise<SignInResult> {
    const user = await this.user.signIn(signInPayload.userNo);
    const curState = await this.user.checkCurrentLoginState(user);

    return {
      state: curState,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo
    }
  }

  @Patch('/nickname')
  @ApiOperation({ description: '유저의 닉네임을 설정합니다. 초대를 받은 유저는 닉네임 설정 후 매칭도 진행합니다.' })
  async setNicknameAndPartner(@Req() req: any, @Body() data: SetNicknameAndPartnerPayload): Promise<UserInfoResponse> {
    const updatedUser = await this.user.setNicknameAndPartner({ userNo: req.user.userNo, data });

    return {
      userNo: updatedUser.userNo,
      nickname: updatedUser.nickname,
      partnerNo: updatedUser.partnerNo
    };
  }

  @Get('/partner')
  @ApiOperation({ description: '투투메이트가 매칭되었는지 확인합니다.' })
  async checkPartner(@Req() req: any): Promise<{ partnerNo: number }> {
    const partnerNo = await this.user.checkPartner(req.user.userNo)

    return {
      partnerNo: partnerNo,
    }
  }

  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.' })
  async me(@Req() req: any): Promise<UserInfoResponse> {
    const user = await this.user.getUser(req.user.userNo);
    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo
    };
  }
}
