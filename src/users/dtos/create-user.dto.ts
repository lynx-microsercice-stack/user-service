import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from './user-role.enum';

export class AddressDto {
  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'user1', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: UserRole.CUSTOMER, required: true })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'John', required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', required: true })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birthDate: Date;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: AddressDto;
}
