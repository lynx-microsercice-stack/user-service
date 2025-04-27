import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { User } from 'src/users/models/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
@Module({
  imports: [TypeOrmModule.forFeature([User]), SharedModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
