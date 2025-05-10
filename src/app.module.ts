import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { User } from './users/models/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [User],
          synchronize: false,
          migrations: [`migrations/*.${isProduction ? 'js' : 'ts'}`],
          migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
    CoreModule,
    SharedModule,
    UsersModule,
    CronjobsModule,
  ],
})
export class AppModule {}
