import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/services/users.service';
@Injectable()
export class UserCleanupCronjob {
  private readonly logger = new Logger(UserCleanupCronjob.name);
  constructor(private readonly userService: UsersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncUsersWithAuthService() {
    this.logger.log('Starting user cleanup job...');
    try {
      const users = [];
      // const keycloakUsers: KeycloakUserDto[] =
      //   await this.callableService.auth.findAllKeycloakUsers();

      // for (const user of users) {
      //   const keycloakUser = keycloakUsers.find(
      //     (authUser) =>
      //       authUser.email === user.email ||
      //       authUser.id === user.authId ||
      //       authUser.username === user.username,
      //   );
      //   if (keycloakUser) {
      //     await this.userService.update(user.id, {
      //       email: keycloakUser.email,
      //       enabled: keycloakUser.enabled,
      //       emailVerified: keycloakUser.emailVerified,
      //       username: keycloakUser.username,
      //       authId: keycloakUser.id,
      //     });
      //   } else {
      //     await this.userService.update(user.id, {
      //       isUnsynced: true,
      //       lastUnsyncedAt: new Date(),
      //     });
      //   }
      // }
      this.logger.log('User cleanup job completed successfully');
    } catch (error) {
      this.logger.error('Error in user cleanup job:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyUserReport() {
    this.logger.log('Starting weekly user report generation...');
    try {
      // Add your report generation logic here
      // For example: Generate user statistics, send reports, etc.
      this.logger.log('Weekly user report generation completed successfully');
    } catch (error) {
      this.logger.error('Error in weekly user report generation:', error);
    }
  }
}
