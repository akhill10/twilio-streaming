import { Module } from '@nestjs/common';
import { TwilioLiveController } from './twilio-live.controller';
import { TwilioLiveService } from './twilio-live.service';

@Module({
  controllers: [TwilioLiveController],
  providers: [TwilioLiveService],
})
export class TwilioLiveModule {}
