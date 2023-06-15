import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserCounter, UserCounterSchema } from './schema/user-counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserCounter.name, schema: UserCounterSchema },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
