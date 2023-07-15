import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'challenge', versionKey: false })
export class ChallengeCounter {
  @Prop()
  key: string;

  @Prop()
  count: number;
}
export type ChallengeCounterDocument = HydratedDocument<ChallengeCounter>;

export const ChallengeCounterSchema = SchemaFactory.createForClass(ChallengeCounter);
