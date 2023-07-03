import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { JwtPayload } from 'src/auth/auth.types';
import { UserService } from 'src/user/user.service';
import { PushPayload, StingPayload } from './dto/notification.dto';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/push')
  @ApiOperation({
    description: 'push알림을 보냅니다. 데이터베이스에 따로 저장을 하지는 않습니다.',
  })
  async push(
    @Body()
    reqBody: PushPayload,
  ): Promise<string> {
    const { deviceToken, message } = reqBody;
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
    description: '찌르기를 했을 때 DB에 저장하고 push알림을 상대에게 보냅니다.',
  })
  async sting(
    @Body()
    ReqBody: StingPayload,
    @JwtParam() jwtParam: JwtPayload,
  ): Promise<Notification> {
    const { userNo } = jwtParam;
    const { message } = ReqBody;
    const title = 'twotoo';

    const stingCount = await this.notificationService.getStingCount({ userNo });
    if (stingCount >= 5) {
      throw new Error('No more Sting');
    }

    const partnerDeviceToken = await this.userService.getPartnerDeviceToken({ userNo });
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
