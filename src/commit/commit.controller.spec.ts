import { Test, TestingModule } from '@nestjs/testing';
import { CommitController } from './commit.controller';
import { CommitService } from './commit.service';

describe('CommitController', () => {
  let controller: CommitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommitController],
      providers: [CommitService],
    }).compile();

    controller = module.get<CommitController>(CommitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
