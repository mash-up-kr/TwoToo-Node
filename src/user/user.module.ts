import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserCounter, UserCounterSchema } from './schema/user-counter.schema';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
    ]),
  ],
  providers: [UserService, AuthGuard, JwtService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
