import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CreateStreamDto } from './dto/createStream.dto';
import { StreamDetailsDto } from './dto/streamDetails.dto';
import { RequestAccessTokenDto } from './dto/RequestAccessToken.dto';
import { TwilioConfigI } from './interfaces/twilioConfig.interface';
import { TwilioLiveService } from './twilio-live.service';

@Controller('twilio-live')
export class TwilioLiveController {
  constructor(private readonly twilioLiveService: TwilioLiveService) {}

  @Get('config')
  @HttpCode(200)
  async getTwilioConfigDetails(): Promise<TwilioConfigI> {
    return await this.twilioLiveService.getConfigDetails();
  }

  @Post('/video/start')
  @HttpCode(201)
  async startVideoStream(@Body() streamDetails: CreateStreamDto) {
    return await this.twilioLiveService.startStream(
      streamDetails.streamName,
      streamDetails.username,
    );
  }

  @Post('end')
  @HttpCode(201)
  async endStream(@Body() streamDetails: StreamDetailsDto) {
    console.log('ENDDD');
    return await this.twilioLiveService.endStream(streamDetails);
  }

  @Post('audio/start')
  @HttpCode(201)
  async startAudioStream(@Body() streamDetails: CreateStreamDto) {
    return await this.twilioLiveService.startAudioStream(
      streamDetails.streamName,
      streamDetails.username,
    );
  }

  @Post('audienceToken')
  @HttpCode(200)
  async createAudienceAccessToken(@Body() stream: RequestAccessTokenDto) {
    return await this.twilioLiveService.getAudienceToken(
      stream.playerStreamerId,
      stream.username,
    );
  }

  @Get('listOfStreams')
  @HttpCode(200)
  async getListOfStreams() {
    return await this.twilioLiveService.listAllStreams();
  }
}
