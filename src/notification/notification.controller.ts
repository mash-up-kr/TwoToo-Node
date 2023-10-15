import {
  Controller,
  Post,
  Body,
  UseGuards,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtParam } from 'src/auth/auth.user.decorator';
import { JwtPayload } from 'src/auth/auth.types';
import { UserService } from 'src/user/user.service';
import {
  NotificaitonType,
  NotificationResDto,
  PushPayload,
  StingPayload,
} from './dto/notification.dto';
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly loggerSvc: LoggerService,
  ) {}

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

    const stingCount = await this.notificationService.getStingCount(userNo);
    if (stingCount >= 5) {
      throw new ConflictException('이미 찌르기 5회를 진행했습니다.');
    }

    const partnerDeviceToken = await this.userService.getPartnerDeviceToken(userNo);
    const user = await this.userService.getUser(userNo);
    const pushRet = await this.notificationService.sendPush({
      nickname: user.nickname,
      message,
      deviceToken: partnerDeviceToken,
      notificationType: NotificaitonType.STING,
    });

    if (pushRet) {
      return await this.notificationService.createSting({
        message,
        userNo,
        notificationType: NotificaitonType.STING,
      });
    } else {
      this.loggerSvc.error('NO Push Return');
    }

    throw new BadRequestException('찌르기 실패했습니다.');
  }
}
