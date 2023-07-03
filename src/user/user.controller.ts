import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SetNicknameAndPartnerPayload,
  SignInResult,
  SignUpPayload,
  SignUpResDto,
  UserInfoResDto,
  SignInPayload,
  GetPartnerResDto,
} from './dto/user.dto';
import { JwtPayload } from 'src/auth/auth.types';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('/signup')
  @ApiOperation({ description: '회원가입을 진행합니다.', summary: '회원가입' })
  @ApiResponse({ status: 200, type: SignUpResDto })
  async signUp(@Body() data: SignUpPayload): Promise<SignUpResDto> {
    const { socialId, loginType, deviceToken } = data;

    let user = await this.user.getUserBySocialIdAndLoginType(socialId, loginType);
    if (user) {
      await this.user.updateDeviceToken({
        userNo: user.userNo,
        deviceToken: deviceToken,
      });

      return {
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
      accessToken: user.accessToken,
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
      socialId: user.socialId,
      loginType: user.loginType,
      deviceToken: user.deviceToken,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/signin')
  @ApiOperation({ description: '로그인을 진행합니다.', summary: '로그인' })
  @ApiResponse({ status: 200, type: SignInResult })
  async signIn(
    @Body() data: SignInPayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<SignInResult> {
    const { deviceToken } = data;
    const { userNo } = jwtParam;
    const user = await this.user.signIn(userNo);
    const curState = await this.user.checkCurrentLoginState(user);

    await this.user.updateDeviceToken({ userNo: user.userNo, deviceToken: deviceToken });

    return {
      state: curState,
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
    description: '투투메이트가 매칭되었는지 확인합니다.',
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
