import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import configuration from '../config/configuration';
import { closeDatabaseConnection } from '../database/database.module';
import { UserDocument } from './schemas/user.schema';
import { createUserStub } from './test/stubs/create-user.stub';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { FundsValidator } from './validators/funds.validator';

jest.mock('./user.repository');
jest.mock('./validators/funds.validator');

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
      ],
      providers: [UserService, UserRepository, FundsValidator],
    }).compile();
    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    describe('When create is called', () => {
      let user: UserDocument;
      let stub: ReturnType<typeof createUserStub>;
      beforeEach(async () => {
        stub = createUserStub(1000, 0, 0);
        const { pln, eur, usd } = stub;
        user = await service.create({
          pln: pln.value,
          eur: eur.value,
          usd: usd.value,
        });
      });
      it('should call repository method', () => {
        expect(repository.createUser).toHaveBeenCalledWith(
          stub.pln.value,
          stub.usd.value,
          stub.eur.value,
        );
      });
      it('should return created user', () => {
        expect(user).toEqual(stub);
      });
    });
  });
});
