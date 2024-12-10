import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleDriveService } from './auth/google-drive-service/google-drive-service.service';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({
      isGlobal: true,
    }),],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
