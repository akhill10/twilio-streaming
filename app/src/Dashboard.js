import { useState, useEffect } from 'react';

import { Flex } from '@twilio-paste/core/flex';
import { Box } from '@twilio-paste/core/box';
import { Card } from '@twilio-paste/core/card';
import { Button } from '@twilio-paste/core/button';
import { Heading } from '@twilio-paste/core/heading';
import { Grid, Column } from '@twilio-paste/core/grid';
import { Anchor } from '@twilio-paste/core/anchor';
import { Text } from '@twilio-paste/core/text';
import { Avatar } from '@twilio-paste/core/avatar';
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { Alert } from '@twilio-paste/core/alert';
import { LoadingIcon } from '@twilio-paste/icons/esm/LoadingIcon';

import StreamPlayer from './audio/StreamPlayer';
import ManageStream from './audio/ManageStream';
import VideoStreamPlayer from './video/VideoStreamPlayer';
import ManageVideoStream from './video/ManageVideoStream';


const Dashboard = ({username, setUsername}) => {
  const [streamList, setStreamList] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoStreaming, setIsVideoStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  const getStreamList = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/twilio-live/listOfStreams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setStreamList(result.streamList);
      setIsLoading(false);

    } catch (error) {
      console.log(error)
      setError(`Unable to get stream list`);
    }
  }

  // When the component loads, get the list of ongoing streams
  useEffect(() => {
    getStreamList();
  }, []);

  return (
    <Card padding='space70' width='50%'>
      <Grid gutter='space30'>
        <Column span={3}>
          <Box backgroundColor='colorBackground' padding='space70' borderRadius='borderRadius20' textAlign='center'>
            <Flex hAlignContent='center' marginBottom='space50'>
              <Avatar size='sizeIcon100' name='avatar' icon={UserIcon}/>
            </Flex>
            <Heading as='h3' variant='heading40'>Hello, {username}!</Heading>
            <Box marginBottom='space50'>
              {!isStreaming && !isVideoStreaming &&
                <Anchor onClick={() => setIsStreaming(true)}>
                  Start a new Audio Only stream
                </Anchor>
              }
              <br></br>
              <br></br>
              {!isVideoStreaming && !isStreaming &&
                <Anchor onClick={() => setIsVideoStreaming(true)}>
                  Start a new Video stream
                </Anchor>
              } 
              {isStreaming &&
                <Anchor onClick={() => setIsStreaming(false)}>
                  Watch a stream
                </Anchor>
              }
            </Box>
            <Box marginBottom='space50'>
              <Anchor onClick={() => setUsername(null)}>
                Sign Out
              </Anchor>
            </Box>
          </Box>
        </Column>
        <Column span={9}>
          {error &&
            <Alert onDismiss={() => setError(null)} variant='error'>
              <Text as='span'>{error}</Text>
            </Alert>
          }
          {info &&
            <Alert onDismiss={() => setInfo(null)} variant='neutral'>
              <Text as='span'>{info}</Text>
            </Alert>
          }
          {isStreaming && !isVideoStreaming &&
            <ManageStream username={username} setError={setError} setInfo={setInfo}/>
          }
          {isVideoStreaming &&
            <ManageVideoStream username={username} setError={setError} setInfo={setInfo}/>
          }
          {!isStreaming && !isVideoStreaming &&
            <Box marginBottom='space50'>
              <Card>
                <Heading as='h3' variant='heading40'>Ongoing Streams</Heading>
                <Box marginBottom='space50'>{streamList.length} streams are live right now</Box>
                {streamList.map((streamDetails) => {
                  console.log(streamDetails);
                  if(streamDetails.streamType === 'audio')
                  return (
                    <StreamPlayer username={username} streamDetails={streamDetails} key={streamDetails.playerStreamerId} setError={setError} setInfo={setInfo}></StreamPlayer>
                  )
                  else 
                  return (
                    <VideoStreamPlayer username={username} streamDetails={streamDetails} key={streamDetails.playerStreamerId} setError={setError} setInfo={setInfo}></VideoStreamPlayer>
                  )
                })}
                <Button variant='primary' type='submit' disabled={isLoading} onClick={getStreamList}>
                  <LoadingIcon decorative={false} title='Refresh button' />
                  Refresh List
                </Button>

              </Card>
            </Box>
          }
        </Column>
      </Grid>
    </Card>
  );
};

export default Dashboard;
