import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserSchema } from '../../user/schema/user.schema';

@Schema({ collection: 'challenge', timestamps: true })
export class Challenge {
  @Prop({ startAt: 1, increment: 1 })
  challengeNo: number;

  @Prop()
  name: string;

  @Prop({ type: UserSchema })
  user1: User; // 챌린지 생성자

  @Prop({ type: UserSchema })
  user2: User; // 챌린지 수락자

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  user1CommitCnt: number;

  @Prop()
  user2CommitCnt: number;

  @Prop()
  user1Flower: string;

  @Prop()
  user2Flower: string;

  @Prop()
  isApproved: boolean;

  @Prop()
  isFinished: boolean;
}
export type ChallengeDocument = HydratedDocument<Challenge>;

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
