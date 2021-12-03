import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StreamDetailsDto {
  @IsNotEmpty({ message: 'Room ID must not be empty' })
  @IsString({ message: 'Room ID should be of type string.' })
  @ApiProperty({
    description: 'Room unique ID',
  })
  roomId: string;

  @IsNotEmpty({ message: 'Stream Name must not be empty' })
  @IsString({ message: 'Stream Name should be of type string.' })
  @ApiProperty()
  streamName: string;

  @IsNotEmpty({ message: 'Player Stream ID must not be empty' })
  @IsString({ message: 'Player Stream ID should be of type string.' })
  @ApiProperty()
  playerStreamerId: string;

  @IsNotEmpty({ message: 'Media Processor ID must not be empty' })
  @IsString({ message: 'Media Processor ID should be of type string.' })
  @ApiProperty()
  mediaProcessorId: string;
}
