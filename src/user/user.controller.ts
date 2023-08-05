import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import {
  SetNicknameAndPartnerPayload,
  UserInfoResDto,
  GetPartnerResDto,
  AuhtorizationPayload,
  AuthorizationResDto,
  GetMyInfoResDto,
} from './dto/user.dto';
import { LOGIN_STATE, UserService } from './user.service';
import { JwtPayload } from 'src/auth/auth.types';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { ChallengeService } from 'src/challenge/challenge.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userSvc: UserService,
    private readonly challengeSvc: ChallengeService,
  ) {}

  @Post('/authorize')
  @ApiOperation({
    description:
      '회원가입 및 로그인을 진행합니다. 토큰이 있다면 로그인 없다면 유저 조회 후 회원가입',
    summary: '회원인증',
  })
  @ApiResponse({ status: 200, type: AuthorizationResDto })
  async authorize(@Body() data: AuhtorizationPayload): Promise<AuthorizationResDto> {
    const { socialId, loginType, deviceToken } = data;

    let user = await this.userSvc.getUserBySocialIdAndLoginType(socialId, loginType);
    if (user) {
      const curState = await this.userSvc.checkCurrentLoginState(user);
      await this.userSvc.updateDeviceToken({
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
    user = await this.userSvc.signUp({ socialId, loginType, deviceToken });
    if (_.isNull(user)) {
      throw new BadRequestException('유저 생성에 실패했습니다.');
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
    description:
      '유저의 닉네임을 설정합니다. 초대를 할 유저는 nickname만 설정하고 partnerNo: null로 요청합니다. 초대를 받은 유저는 nickname과 partnerNo를 모두 설정해야 합니다.',
    summary: '닉네임 설정 및 파트너 매칭',
  })
  @ApiResponse({ status: 200, type: UserInfoResDto })
  async setNicknameAndPartner(
    @JwtParam() jwtParam: JwtPayload,
    @Body() data: SetNicknameAndPartnerPayload,
  ): Promise<UserInfoResDto> {
    const { userNo } = jwtParam;
    const updatedUser = await this.userSvc.setNicknameAndPartner({
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
    const partnerNo = await this.userSvc.checkPartner(userNo);

    return {
      partnerNo: partnerNo,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/me')
  @ApiOperation({ description: '내 정보를 조회합니다.', summary: '내 정보 조회' })
  @ApiResponse({ status: 200, type: GetMyInfoResDto })
  async me(@JwtParam() jwtParam: JwtPayload): Promise<GetMyInfoResDto> {
    const { userNo } = jwtParam;
    const user = await this.userSvc.getUser(userNo);

    let partnerNickname = null;
    if (!_.isNull(user.partnerNo)) {
      const partner = await this.userSvc.getUser(user.partnerNo as number);
      partnerNickname = partner.nickname;
    }

    const totalChallengeCount = await this.challengeSvc.countUserChallenges(userNo);

    return {
      userNo: user.userNo,
      nickname: user.nickname,
      partnerNo: user.partnerNo,
      partnerNickname: partnerNickname,
      totalChallengeCount,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('/signOut')
  @ApiOperation({
    description: '유저를 탈퇴 합니다. 파트너도 같이 삭제 됩니다.',
    summary: '유저 탈퇴',
  })
  @ApiResponse({ status: 200, type: Boolean })
  async signOut(@JwtParam() jwtParam: JwtPayload): Promise<Boolean> {
    const { userNo } = jwtParam;
    const user = await this.userSvc.getUser(userNo);
    let partenrRet = true;

    if (user.partnerNo) {
      partenrRet = await this.userSvc.delUser(user.partnerNo);
    }
    const ret = await this.userSvc.delUser(userNo);

    return ret && partenrRet;
  }
}
