import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import {
  databaseTestModule,
  closeDatabaseConnection,
} from '../../../database/database.module';
import {
  Transfer,
  TransferDocument,
  TransferSchema,
} from '../../schemas/transfer.schema';
import { TransferRepository } from '../../transfer.repository';
import { TransferService } from '../../transfer.service';
import { FundsValidator } from '../../../user/validators/funds.validator';
import { Model, Types } from 'mongoose';
import { UserService } from '../../../user/user.service';
import { transferStub } from '../stubs/transfer.stub';
jest.mock('../../../user/user.service');

describe('TransferService', () => {
  let service: TransferService;
  let transferModel: Model<TransferDocument>;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        databaseTestModule(),
        MongooseModule.forFeature([
          { name: Transfer.name, schema: TransferSchema },
        ]),
      ],
      providers: [
        TransferService,
        TransferRepository,
        FundsValidator,
        UserService,
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    transferModel = module.get<typeof transferModel>('TransferModel');
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });
  afterEach(async () => {
    await transferModel.deleteMany();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    describe('When create is called', () => {
      let transfers: TransferDocument[];
      let createdTransfer: TransferDocument;
      beforeEach(async () => {
        transfers = await transferModel.find();
        const stub = transferStub();
        const createTransferDto = {
          receiverId: stub.receiver.toString(),
          senderId: stub.sender.toString(),
          currency: stub.currency,
          funds: stub.funds,
        };
        createdTransfer = await service.create(createTransferDto);
      });
      it('should return created transfer', async () => {
        expect(transfers).toEqual([]);
        transfers = await transferModel.find();
        expect(transfers.toString()).toEqual([createdTransfer].toString());
      });
    });
  });
  describe('Finding transfers', () => {
    let transfer: TransferDocument;
    beforeEach(async () => {
      transfer = await new transferModel({ ...transferStub() }).save();
    });
    describe('findAll', () => {
      describe('When findAll is called', () => {
        let transfers: TransferDocument[];
        beforeEach(async () => {
          transfers = await service.findAll();
        });
        it('should return found transfers', () => {
          expect(transfers.toString()).toEqual([transfer].toString());
        });
      });
    });
    describe('findByReceiverId', () => {
      describe('When findByReceiverId is called', () => {
        describe('When findByReceiverId has a date range', () => {
          let matchedTransfer: TransferDocument;
          beforeEach(async () => {
            const receiverId = new Types.ObjectId();
            await new transferModel({
              ...transferStub(new Date(2000, 1, 16), undefined, receiverId),
            }).save();
            await new transferModel({
              ...transferStub(new Date(2000, 1, 20), undefined, receiverId),
            }).save();
            matchedTransfer = await new transferModel({
              ...transferStub(new Date(2000, 1, 18), undefined, receiverId),
            }).save();
          });
          describe('When findByReceiverId has found transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              transfers = await service.findByReceiverId(
                matchedTransfer.receiver,
                new Date(2000, 1, 17),
                new Date(2000, 1, 19),
              );
            });
            it('should return found transfers', () => {
              expect(transfers.toString()).toEqual(
                [matchedTransfer].toString(),
              );
            });
          });
          describe('When findByReceiverId has found no transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              transfers = await service.findByReceiverId(
                matchedTransfer.receiver,
                new Date(2000, 1, 21),
                new Date(2000, 1, 30),
              );
            });
            it('should return an empty array', () => {
              expect(transfers).toEqual([]);
            });
          });
        });
        describe('When findByReceiver has no date range', () => {
          describe('When findByReceiverId has found no transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              const newStub = transferStub();
              await new transferModel({ ...transferStub() }).save();
              transfers = await service.findByReceiverId(
                newStub.receiver.toString(),
              );
            });
            it('should return an empty array', () => {
              expect(transfers).toEqual([]);
            });
          });
          describe('When findByReceiverId has found transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              await new transferModel({ ...transferStub() }).save();
              transfers = await service.findByReceiverId(transfer.receiver);
            });
            it('should return found transfers', () => {
              expect(transfers.toString()).toEqual([transfer].toString());
            });
          });
        });
      });
    });
    describe('findBySenderId', () => {
      describe('When findBySenderId is called', () => {
        describe('When findBySenderId has a date range', () => {
          let matchedTransfer: TransferDocument;
          beforeEach(async () => {
            const senderId = new Types.ObjectId();
            await new transferModel({
              ...transferStub(new Date(2000, 1, 16), senderId),
            }).save();
            await new transferModel({
              ...transferStub(new Date(2000, 1, 20), senderId),
            }).save();
            matchedTransfer = await new transferModel({
              ...transferStub(new Date(2000, 1, 18), senderId),
            }).save();
          });
          describe('When findBySenderId has found transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              transfers = await service.findBySenderId(
                matchedTransfer.sender,
                new Date(2000, 1, 17),
                new Date(2000, 1, 19),
              );
            });
            it('should return found transfers', () => {
              expect(transfers.toString()).toEqual(
                [matchedTransfer].toString(),
              );
            });
          });
          describe('When findBySenderId has found no transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              transfers = await service.findBySenderId(
                matchedTransfer.sender,
                new Date(2000, 1, 21),
                new Date(2000, 1, 30),
              );
            });
            it('should return an empty array', () => {
              expect(transfers).toEqual([]);
            });
          });
        });
        describe('When findBySenderId has no date range', () => {
          describe('When findBySenderId has found no transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              const newStub = transferStub();
              await new transferModel({ ...transferStub() }).save();
              transfers = await service.findBySenderId(
                newStub.sender.toString(),
              );
            });
            it('should return an empty array', () => {
              expect(transfers).toEqual([]);
            });
          });
          describe('When findBySenderId has found transfers', () => {
            let transfers: TransferDocument[];
            beforeEach(async () => {
              await new transferModel({ ...transferStub() }).save();
              transfers = await service.findBySenderId(transfer.sender);
            });
            it('should return found transfers', () => {
              expect(transfers.toString()).toEqual([transfer].toString());
            });
          });
        });
      });
    });
  });
});
