import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.entity';
import { RoleAuthGuard } from 'src/core/guards/role-auth.guard';
import { Roles } from 'src/core/decorators/role.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ======= CREATE USER =======
   * @param createUserDto
   * @returns
   */
  @Post('/create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * ======= GET ALL USERS =======
   * @returns
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @Roles('ADMIN', 'TECH_USER')
  async findAll(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => user.withoutAuthId());
  }

  @Get('keycloak')
  @ApiOperation({ summary: 'Get all users from keycloak' })
  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @ApiResponse({ status: 200, description: 'Return all users from keycloak.' })
  @Roles('ADMIN', 'TECH_USER')
  async findAllFromKeycloak(): Promise<User[]> {
    return this.usersService.findAllFromKeycloak();
  }
  /**
   * ======= GET USER BY ID =======
   * @param id
   * @returns
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /**
   * ======= DELETE USER =======
   * @param id
   * @returns
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
