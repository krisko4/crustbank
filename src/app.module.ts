import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { UserModule } from './user/user.module';
import { TransferModule } from './transfer/transfer.module';
import { databaseTestModule } from './database/database.module';

@Module({
  imports: [
    databaseTestModule(),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    UserModule,
    TransferModule,
  ],
})
export class AppModule {}
