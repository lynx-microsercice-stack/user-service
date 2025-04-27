import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiClientService } from 'src/shared/services/api-client.service';
import { DeepPartial, Repository } from 'typeorm';
import { AuthServiceRegisterUserReqDto } from '../dtos/auth-service-register-user-req.dto';
import { AuthServiceResponseDto } from '../dtos/auth-service-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { KeycloakUserDto } from '../dtos/keycloak-user.dto';
import { User } from '../models/user.entity';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly apiClientService: ApiClientService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating user with email: ${createUserDto.email}`);
      const authDtoReq: AuthServiceRegisterUserReqDto = createUserDto;

      // create user in database
      const { address, password, role, firstName, lastName, ...userData } =
        createUserDto;

      // Format birthDate to ISO string if it exists
      const formattedData: DeepPartial<User> = {
        ...userData,
        birthDate: userData.birthDate
          ? new Date(userData.birthDate)
          : undefined,
        address: address
          ? {
              street: address.street,
              city: address.city,
              district: address.district,
              country: address.country,
              postalCode: address.postalCode,
            }
          : undefined,
      };

      const user = await this.userRepository.save(formattedData);

      // register user in auth service
      const authData: AuthServiceResponseDto =
        await this.apiClientService.retryFetchTokenWrapper(async () =>
          this.apiClientService.auth.register(authDtoReq),
        );
      const keycloakId = authData.data;

      const authUserResponse =
        await this.apiClientService.retryFetchTokenWrapper(async () =>
          this.apiClientService.auth.findUserByKeycloakId(keycloakId),
        );
      const authUser: KeycloakUserDto = await authUserResponse.data;

      // update user with authId
      await this.userRepository.update(user.id, {
        authId: authUser.id,
        emailVerified: authUser.emailVerified,
        enabled: authUser.enabled,
      });

      // Fetch the updated user
      const updatedUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!updatedUser) {
        throw new NotFoundException(
          `User with ID ${user.id} not found after update`,
        );
      }

      this.logger.log(`User created successfully with ID: ${user.id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    // find all but not collect authId
    const users = await this.userRepository.find({
      select: {
        authId: false,
      },
    });
    this.logger.log(`Found ${users.length} users`);
    return users;
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Found user with ID: ${id}`);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Fetching user with email: ${email}`);
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    this.logger.log(`Found user with email: ${email}`);
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      const { address, ...userData } = updateData;

      // Format birthDate if it exists
      const formattedData: DeepPartial<User> = {
        ...userData,
        birthDate: userData.birthDate
          ? new Date(userData.birthDate)
          : undefined,
        ...(address && {
          street: address.street,
          city: address.city,
          district: address.district,
          country: address.country,
          postalCode: address.postalCode,
        }),
      };

      await this.userRepository.update(id, formattedData);

      // Fetch the updated user
      const updatedUser = await this.userRepository.findOne({
        where: { id },
      });

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User updated successfully with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      throw new HttpException('Failed to update user', 500);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Removing user with ID: ${id}`);
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User removed successfully with ID: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove user: ${error.message}`, error.stack);
      throw new HttpException('Failed to remove user', 500);
    }
  }

  async findAllFromKeycloak(): Promise<User[]> {
    return await this.apiClientService.retryFetchTokenWrapper(async () =>
      this.apiClientService.auth.findAllKeycloakUsers(),
    );
  }
}
