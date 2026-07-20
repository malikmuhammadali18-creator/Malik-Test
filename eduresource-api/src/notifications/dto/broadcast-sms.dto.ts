import { IsArray, ArrayNotEmpty, IsNotEmpty, IsString, ArrayUnique, IsPhoneNumber } from 'class-validator';

export class BroadcastSmsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsPhoneNumber(undefined, { each: true })
  numbers: string[];

  @IsString()
  @IsNotEmpty()
  message: string;
}
