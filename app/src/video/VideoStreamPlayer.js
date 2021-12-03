import { useState, useEffect} from 'react';
import { Box } from '@twilio-paste/core/box';
import { Heading } from '@twilio-paste/heading';
import TwilioLivePlayerScript from '../TwilioLivePlayerScript';
import VideoAudienceScript from '../VideoAudienceScript';

const VideoStreamPlayer = ({username, streamDetails, setError, setInfo}) => {
  const [player, setPlayer] = useState(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (player != null) {
      player.setVolume(volume/100);
    }

  }, [volume, player]);
  const playStream = async () => {
    setIsLoading(true)
    setIsPlaying(true);
    setIsLoading(false);
  }

  
  return (
      
    <Box backgroundColor='#e6edf7' padding='space60' marginBottom='space70'>
    <Heading as='h4'>{streamDetails.streamName}</Heading>
      <div>
          <TwilioLivePlayerScript/>
          <VideoAudienceScript/>

      <div id='player' >
      </div>

      <button id='streamStartEnd' sid={streamDetails.playerStreamerId} username={username}>
        Play Stream
      </button>

    </div>
    </Box>
  )
}

export default VideoStreamPlayer;