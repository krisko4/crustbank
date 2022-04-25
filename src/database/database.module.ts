import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';

let server: MongoMemoryServer;

export const databaseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      server = await MongoMemoryServer.create();
      const uri = server.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeDatabaseConnection = async () => {
  await disconnect();
  if (server) await server.stop();
};
