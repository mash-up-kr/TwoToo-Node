import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { JwtPayload } from 'src/auth/auth.types';
import { UserService } from 'src/user/user.service';
import { NotificationResDto, PushPayload, StingPayload } from './dto/notification.dto';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/push')
  @ApiOperation({
    description: 'push알림을 전송합니다. 데이터베이스에 따로 저장하지 않습니다.',
    summary: '푸쉬 알림 전송',
  })
  @ApiResponse({ status: 200, type: String })
  async push(@Body() data: PushPayload): Promise<string> {
    const { deviceToken, message } = data;
    const title = 'TwoToo';
    return await this.notificationService.sendPush({
      deviceToken,
      title,
      message,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/sting')
  @ApiOperation({
    description: '찌르기를 했을때 데이터베이스에 저장하고, push알림을 파트너에게 전송합니다.',
    summary: '찌르기 기능',
  })
  @ApiResponse({ status: 200, type: NotificationResDto })
  async sting(
    @Body() data: StingPayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<NotificationResDto> {
    const { userNo } = jwtParam;
    const { message } = data;
    const title = 'twotoo';

    const stingCount = await this.notificationService.getStingCount(userNo);
    if (stingCount >= 5) {
      throw new Error('No more Sting');
    }

    const partnerDeviceToken = await this.userService.getPartnerDeviceToken(userNo);
    const pushRet = await this.notificationService.sendPush({
      message,
      deviceToken: partnerDeviceToken,
      title,
    });

    if (pushRet) {
      return await this.notificationService.createSting({ message, userNo });
    }

    throw new Error('Fail to Sting');
  }
}
