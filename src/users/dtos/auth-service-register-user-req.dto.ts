import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsEmail } from 'class-validator';
import { UserRole } from './user-role.enum';

export class AuthServiceRegisterUserReqDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
