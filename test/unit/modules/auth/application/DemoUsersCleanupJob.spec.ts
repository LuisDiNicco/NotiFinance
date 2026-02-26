import { Test, TestingModule } from '@nestjs/testing';
import { DemoUsersCleanupJob } from '../../../../../src/modules/auth/infrastructure/primary-adapters/jobs/DemoUsersCleanupJob';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../../../src/modules/auth/application/IUserRepository';

describe('DemoUsersCleanupJob', () => {
  let job: DemoUsersCleanupJob;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteExpiredDemoUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoUsersCleanupJob,
        {
          provide: USER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    job = module.get(DemoUsersCleanupJob);
  });

  it('deletes demo users older than 24h', async () => {
    repository.deleteExpiredDemoUsers.mockResolvedValue(2);

    await job.cleanupExpiredDemoUsers();

    expect(repository.deleteExpiredDemoUsers).toHaveBeenCalledTimes(1);
    const [expirationDate] =
      repository.deleteExpiredDemoUsers.mock.calls[0] ?? [];
    expect(expirationDate).toBeInstanceOf(Date);
  });
});
