import { Injectable } from '@nestjs/common';
import { CreateCommitDto } from './dto/create-commit.dto';
import { UpdateCommitDto } from './dto/update-commit.dto';

@Injectable()
export class CommitService {
  create(createCommitDto: CreateCommitDto) {
    return 'This action adds a new commit';
  }

  findAll() {
    return `This action returns all commit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commit`;
  }

  update(id: number, updateCommitDto: UpdateCommitDto) {
    return `This action updates a #${id} commit`;
  }

  remove(id: number) {
    return `This action removes a #${id} commit`;
  }
}
