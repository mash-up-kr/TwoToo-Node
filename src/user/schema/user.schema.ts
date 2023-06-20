import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'user' })
export class User {
  @Prop({ index: true, unique: true })
  userNo: number;

  @Prop()
  nickname: string;

  @Prop()
  partnerNo: number;
}
export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
