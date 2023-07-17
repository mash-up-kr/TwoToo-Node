import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'commit', versionKey: false })
export class CommitCounter {
  @Prop()
  key: string;

  @Prop()
  count: number;
}
export type CommitCounterDocument = CommitCounter & Document;

export const CommitCounterSchema = SchemaFactory.createForClass(CommitCounter);
