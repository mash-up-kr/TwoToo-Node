import { Test, TestingModule } from '@nestjs/testing';
import { CommitService } from './commit.service';

describe('CommitService', () => {
  let service: CommitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommitService],
    }).compile();

    service = module.get<CommitService>(CommitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
