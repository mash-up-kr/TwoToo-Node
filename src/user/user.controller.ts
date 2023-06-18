import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  SetNicknameAndPartnerPayload,
  SignInResult,
  signUpPayload,
  SignUpResult,
  UserInfoResponse,
  signInPayload,
} from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('/signup')
  @ApiOperation({ description: '회원가입을 진행합니다.' })
  async signUp(@Body() signUpPayload: signUpPayload): Promise<SignUpResult> {
    const { socialId, loginType } = signUpPayload;
    let user = await this.user.getUserBySocialIdAndLoginType(
      socialId,
      loginType,
    );
    if (user) {
      return {
        accessToken: user.accessToken,
        userNo: user.userNo,
        nickname: user.nickname,
        partnerNo: user.partnerNo,
        socialId: user.socialId,
        loginType: user.loginType,
      };
    }
    user = await this.user.signUp({ socialId, loginType });
    if(!user){
      console.log('cannot make user');
    }
    return {
      accessToken: user.accessToken,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
      socialId: user.socialId,
      loginType: user.loginType,
    };
  }

  

  // TODO: AuthGuard
  @UseGuards(AuthGuard)
  @Post('/signin')
  @ApiOperation({ description: '로그인을 진행합니다.' })
  async signIn(@Body() signInPayload: signInPayload): Promise<SignInResult> {
    const user = await this.user.signIn(signInPayload.userNo);
    const curState = await this.user.checkCurrentLoginState(user);

    return {
      state: curState,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
      socialId: user.socialId,
      loginType: user.loginType,
    };
  }

  // TODO: AuthGuard
  @Patch('/nickname')
  @ApiOperation({
    description:
      '유저의 닉네임을 설정합니다. 초대를 받은 유저는 닉네임 설정 후 매칭도 진행합니다.',
  })
  async setNicknameAndPartner(
    @Req() req: any,
    @Body() data: SetNicknameAndPartnerPayload,
  ): Promise<UserInfoResponse> {
    const updatedUser = await this.user.setNicknameAndPartner({
      userNo: parseInt(req.user.userNo),
      data,
    });

    return {
      userNo: updatedUser.userNo,
      nickname: updatedUser.nickname,
      partnerNo: updatedUser.partnerNo,
    };
  }

  // TODO: AuthGuard
  @Get('/partner')
  @ApiOperation({ description: '투투메이트가 매칭되었는지 확인합니다.' })
  async checkPartner(@Req() req: any): Promise<{ partnerNo: number }> {
    const partnerNo = await this.user.checkPartner(parseInt(req.user.userNo));

    return {
      partnerNo: partnerNo,
    };
  }

  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.' })
  async me(@Req() req: any): Promise<UserInfoResponse> {
    const user = await this.user.getUser(parseInt(req.user.userNo));
    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
    };
  }
}
