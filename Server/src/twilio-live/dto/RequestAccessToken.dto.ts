import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestAccessTokenDto {
  @IsNotEmpty({ message: 'Identity should not be empty' })
  @IsString({ message: 'Room ID should be of type string.' })
  @ApiProperty({
    required: true,
  })
  playerStreamerId: string;

  @IsNotEmpty({ message: 'Room Id shoould not be empty' })
  @IsString({ message: 'Room Id should be of type string.' })
  @ApiProperty({
    required: true,
  })
  username: string;
}
