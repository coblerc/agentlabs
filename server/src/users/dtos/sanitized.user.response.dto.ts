import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class SanitizedUserResponseDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsBoolean()
  isVerified: boolean;

  @IsBoolean()
  hasPassword: boolean;
}
