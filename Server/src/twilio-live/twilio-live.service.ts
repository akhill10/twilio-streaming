import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioConfigI } from './interfaces/twilioConfig.interface';
import * as twilio from 'twilio';
import * as crypto from 'crypto';
import { StreamDetailsDto } from './dto/streamDetails.dto';

@Injectable()
export class TwilioLiveService {
  private accessToken: any;
  private videoGrant: any;
  private PlaybackGrant: any;
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    this.accessToken = twilio.jwt.AccessToken;
    this.videoGrant = this.accessToken.VideoGrant;
    this.twilioClient = twilio(
      this.configService.get<string>('TWILIO_API_KEY_SID'),
      this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      { accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID') },
    );
    this.PlaybackGrant = this.accessToken.PlaybackGrant;
  }

  async getConfigDetails(): Promise<TwilioConfigI> {
    return {
      accountSID: this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      accountAPIKey: this.configService.get<string>('TWILIO_API_KEY_SID'),
      accountSecrectKey: this.configService.get<string>(
        'TWILIO_API_KEY_SECRET',
      ),
    };
  }

  async startStream(streamName: string, username: string) {
    try {
      const room = await this.twilioClient.video.rooms.create({
        uniqueName: streamName,
        type: 'go',
      });
      const playerStreamer =
        await this.twilioClient.media.playerStreamer.create();
      const mediaProcessor =
        await this.twilioClient.media.mediaProcessor.create({
          extension: 'video-composer-v1',
          extensionContext: JSON.stringify({
            identity: 'video-composer-v1',
            room: {
              name: room.sid,
            },
            outputs: [playerStreamer.sid],
          }),
        });

      console.log('Video ROOM PLAYERS ', playerStreamer, mediaProcessor);
      const token = new twilio.jwt.AccessToken(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      );
      const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
        room: streamName,
      });

      token.addGrant(videoGrant);
      token.identity = username;
      return {
        streamDetails: {
          roomId: room.sid,
          streamName: streamName,
          playerStreamerId: playerStreamer.sid,
          mediaProcessorId: mediaProcessor.sid,
        },
        token: token.toJwt(),
      };
    } catch (error) {
      console.log(error);
      return new BadRequestException({
        message: `Unable to create livestream `,
      });
    }
  }

  async endStream(streamDetails: StreamDetailsDto) {
    const streamName = streamDetails.streamName;
    const roomId = streamDetails.roomId;
    const playerStreamerId = streamDetails.playerStreamerId;
    const mediaProcessorId = streamDetails.mediaProcessorId;

    try {
      await this.twilioClient.media
        .mediaProcessor(mediaProcessorId)
        .update({ status: 'ended' });
      await this.twilioClient.media
        .playerStreamer(playerStreamerId)
        .update({ status: 'ended' });
      await this.twilioClient.video
        .rooms(roomId)
        .update({ status: 'completed' });

      return {
        message: `Successfully ended stream ${streamName}`,
      };
    } catch (err) {
      return new BadRequestException({
        message: 'Unable to end the stream',
      });
    }
  }

  async createStreamerAccessToken(identity: string, roomId: string) {
    try {
      const videoGrant = new this.videoGrant({
        room: roomId,
      });

      const token = new this.accessToken(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      );

      token.addGrant(videoGrant);
      token.identity = identity;

      return {
        token: token.toJwt(),
      };
    } catch (err) {
      return new BadRequestException(
        err,
        'Unable to create streamer access token',
      );
    }
  }

  async createAudienceAccessToken() {
    const identity = crypto.randomBytes(20).toString('hex');
    try {
      const playerStreamerList =
        await this.twilioClient.media.playerStreamer.list({
          status: 'started',
        });
      const playerStreamer = playerStreamerList.length
        ? playerStreamerList[0]
        : null;

      if (!playerStreamer) {
        return {
          message: `No one is streaming right now`,
        };
      }

      const token = new this.accessToken(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      );

      const playbackGrant = await this.twilioClient.media
        .playerStreamer(playerStreamer.sid)
        .playbackGrant()
        .create({ ttl: 60 });

      const wrappedPlaybackGrant = new this.PlaybackGrant({
        grant: playbackGrant.grant,
      });

      token.addGrant(wrappedPlaybackGrant);
      token.identity = identity;

      return {
        token: token.toJwt(),
      };
    } catch (error) {
      return new BadRequestException({
        message: 'Unable to view livestream',
        error: error,
      });
    }
  }

  async startAudioStream(streamName: string, username: string) {
    try {
      const audioRoom = await this.twilioClient.video.rooms.create({
        uniqueName: streamName,
        audioOnly: true,
        type: 'group',
      });

      const playerStreamer =
        await this.twilioClient.media.playerStreamer.create({ video: false });
      const mediaProcessor =
        await this.twilioClient.media.mediaProcessor.create({
          extension: 'audio-mixer-v1',
          extensionContext: JSON.stringify({
            identity: 'audio-mixer-v1',
            room: {
              name: audioRoom.sid,
            },
            outputs: [playerStreamer.sid],
          }),
        });
      console.log('ROOM PLAYERS ', playerStreamer, mediaProcessor);
      const token = new twilio.jwt.AccessToken(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      );
      const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
        room: streamName,
      });

      token.addGrant(videoGrant);
      token.identity = username;
      return {
        streamDetails: {
          roomId: audioRoom.sid,
          streamName: streamName,
          playerStreamerId: playerStreamer.sid,
          mediaProcessorId: mediaProcessor.sid,
        },
        token: token.toJwt(),
      };
    } catch (err) {
      console.log('ERROR ::: ', err);
      return err;
    }
  }

  async listAudioOnlyStreams() {
    try {
      const mediaProcessorList =
        await this.twilioClient.media.mediaProcessor.list({
          status: 'started',
        });

      const LiveStreams = mediaProcessorList.map((mp) => {
        if (mp.extension === 'audio-mixer-v1') {
          mp.stream_type = 'audio';
          return mp;
        } else if (mp.extension === 'video-composer-v1') {
          mp.stream_type = 'video';
          return mp;
        }
      });

      const streamList = [];

      for (const stream of LiveStreams) {
        const extensionContext = JSON.parse(stream.extensionContext);
        const playerStreamerId = extensionContext.outputs[0];
        const roomId = extensionContext.room.name;
        const room = await this.twilioClient.video.rooms(roomId).fetch();
        const streamName = room.uniqueName;
        const streamType = stream.stream_type;

        const streamDetails = {
          streamName,
          playerStreamerId,
          streamType,
        };
        streamList.push(streamDetails);
      }

      return {
        streamList: streamList,
      };
    } catch (err) {
      return new InternalServerErrorException({
        message: `Unable to create Stream`,
        error: err,
      });
    }
  }

  async getAudienceToken(playerStreamerId: string, username: string) {
    try {
      const token = new twilio.jwt.AccessToken(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SID'),
        this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      );
      const playbackGrant = await this.twilioClient.media
        .playerStreamer(playerStreamerId)
        .playbackGrant()
        .create({ ttl: 60 });
      const wrappedPlaybackGrant = new twilio.jwt.AccessToken.PlaybackGrant({
        grant: playbackGrant.grant,
      });
      token.addGrant(wrappedPlaybackGrant);
      token.identity = username;
      return {
        token: token.toJwt(),
      };
    } catch (err) {
      return new InternalServerErrorException({
        message: `Unable to create Stream`,
        error: err,
      });
    }
  }
}
