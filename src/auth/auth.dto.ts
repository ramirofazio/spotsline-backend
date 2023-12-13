import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  Validate,
} from 'class-validator';

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

export class signInDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class activeUserDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class initPasswordResetRequest {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class confirmPasswordResetRequest {
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
  newConfirmPassword: string;
}
