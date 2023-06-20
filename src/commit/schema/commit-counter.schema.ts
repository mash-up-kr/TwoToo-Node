import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'commit' })
export class CommitCounter {
  @Prop()
  key: string;

  @Prop()
  count: number;
}
export type CommitCounterDocument = HydratedDocument<CommitCounter>;

export const CommitCounterSchema = SchemaFactory.createForClass(CommitCounter);
