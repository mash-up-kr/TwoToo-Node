import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'challenge' })
export class ChallengeCounter {
  @Prop()
  key: string;

  @Prop()
  count: number;
}
export type ChallengeCounterDocument = ChallengeCounter & Document;

export const ChallengeCounterSchema = SchemaFactory.createForClass(ChallengeCounter);
