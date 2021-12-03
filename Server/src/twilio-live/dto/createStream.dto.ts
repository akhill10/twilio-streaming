import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStreamDto {
  @IsNotEmpty({ message: 'Stream Name must not be empty' })
  @IsString({ message: 'Stream Name should be of type string.' })
  @ApiProperty()
  streamName: string;

  @IsNotEmpty({ message: 'User Name must not be empty' })
  @IsString({ message: 'Username Name should be of type string.' })
  @ApiProperty()
  username: string;
}
