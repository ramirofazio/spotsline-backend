import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  Validate,
} from 'class-validator';
import { Client } from 'src/clients/clients.dto';

@ValidatorConstraint({ name: 'isEqual', async: false })
class IsEqualConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: string, args: any) {
    return value === args.object[args.constraints[0]];
  }

  defaultMessage() {
    return 'Las contraseñas no coinciden';
  }
}

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
export class InitPasswordResetRequestDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PasswordResetRequestDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsEqualConstraint, ['newPassword'])
  newPasswordConfirm: string;
}

export class SignInResponseDTO {
  access_token: string;
  client: Client;
}
