import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { LOGIN_STATE, UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SetNicknameAndPartnerPayload,
  UserInfoResDto,
  GetPartnerResDto,
  AuhtorizationPayload,
  AuthorizationResDto,
} from './dto/user.dto';
import { JwtPayload } from 'src/auth/auth.types';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('/authorize')
  @ApiOperation({
    description:
      '회원가입 및 로그인을 진행합니다. 토큰이 있다면 로그인 없다면 유저 조회 후 회원가입',
    summary: '회원인증',
  })
  @ApiResponse({ status: 200, type: AuthorizationResDto })
  async authorize(@Body() data: AuhtorizationPayload): Promise<AuthorizationResDto> {
    const { socialId, loginType, deviceToken } = data;

    let user = await this.user.getUserBySocialIdAndLoginType(socialId, loginType);
    if (user) {
      const curState = await this.user.checkCurrentLoginState(user);
      await this.user.updateDeviceToken({
        userNo: user.userNo,
        deviceToken: deviceToken,
      });
      return {
        state: curState,
        accessToken: user.accessToken,
        userNo: user.userNo,
        nickname: user.nickname,
        partnerNo: user.partnerNo,
        socialId: user.socialId,
        loginType: user.loginType,
        deviceToken: deviceToken,
      };
    }
    user = await this.user.signUp({ socialId, loginType, deviceToken });
    if (!user) {
      throw new Error('Create User Failed');
    }

    return {
      //회원가입을 하면 무조건 NEED_NICKNAME상태
      state: LOGIN_STATE.NEED_NICKNAME,
      accessToken: user.accessToken,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
      socialId: user.socialId,
      loginType: user.loginType,
      deviceToken: deviceToken,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('/nickname')
  @ApiOperation({
    description: '유저의 닉네임을 설정합니다. 초대를 받은 유저는 닉네임 설정 후 매칭도 진행합니다.',
    summary: '닉네임 설정 및 파트너 매칭',
  })
  @ApiResponse({ status: 200, type: UserInfoResDto })
  async setNicknameAndPartner(
    @JwtParam() jwtParam: JwtPayload,
    @Body() data: SetNicknameAndPartnerPayload,
  ): Promise<UserInfoResDto> {
    const { userNo } = jwtParam;
    const updatedUser = await this.user.setNicknameAndPartner({
      userNo: userNo,
      data,
    });

    return {
      userNo: updatedUser.userNo,
      nickname: updatedUser.nickname,
      partnerNo: updatedUser.partnerNo,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/partner')
  @ApiOperation({
    description: '파트너 정보를 조회합니다.',
    summary: '파트너 정보 조회',
  })
  @ApiResponse({ status: 200, type: GetPartnerResDto })
  async getPartner(@JwtParam() jwtParam: JwtPayload): Promise<GetPartnerResDto> {
    const { userNo } = jwtParam;
    const partnerNo = await this.user.checkPartner(userNo);

    return {
      partnerNo: partnerNo,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.', summary: '내 정보 조회' })
  @ApiResponse({ status: 200, type: UserInfoResDto })
  async me(@JwtParam() jwtParam: JwtPayload): Promise<UserInfoResDto> {
    const { userNo } = jwtParam;
    const user = await this.user.getUser(userNo);
    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
    };
  }
}
