import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from '../users/users.module';
import { UserCleanupCronjob } from './user-cleanup.cronjob';

@Module({
  imports: [ScheduleModule.forRoot(), UsersModule],
  providers: [UserCleanupCronjob],
  exports: [UserCleanupCronjob],
})
export class CronjobsModule {}
