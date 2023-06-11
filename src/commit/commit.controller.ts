import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommitService } from './commit.service';
import { CreateCommitDto } from './dto/create-commit.dto';
import { UpdateCommitDto } from './dto/update-commit.dto';

@Controller('commit')
export class CommitController {
  constructor(private readonly commitService: CommitService) {}

  @Post()
  create(@Body() createCommitDto: CreateCommitDto) {
    return this.commitService.create(createCommitDto);
  }

  @Get()
  findAll() {
    return this.commitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commitService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommitDto: UpdateCommitDto) {
    return this.commitService.update(+id, updateCommitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commitService.remove(+id);
  }
}
