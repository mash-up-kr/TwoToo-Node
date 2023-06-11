import { Module } from '@nestjs/common';
import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Commit as CommitEntity, CommitEntitySchema } from './entities/commit.entity';

@Module({
  imports: [
     MongooseModule.forFeature([{ name: CommitEntity.name, schema: CommitEntitySchema}])
  ],
  controllers: [CommitController],
  providers: [CommitService]
})
export class CommitModule {}
