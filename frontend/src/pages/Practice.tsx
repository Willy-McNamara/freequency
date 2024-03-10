import { Button, Flex, Textarea, Text, Heading, Box } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import SaveSessionModal from './components/SaveSessionModal';
import DurationTimer from './components/DurationTimer';
import AudioDisplay from './components/AudioDisplay';
import RecordAudio from './components/RecordAudio';

const Practice = () => {
  const notesRef = useRef(null);
  const durationRef = useRef(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [startOrResume, setStartOrResume] = useState('Start Session');
  const [time, setTime] = useState<number>(0);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else {
      clearInterval(interval!);
    }

    return () => {
      clearInterval(interval!);
    };
  }, [isActive, isPaused]);

  const handleStartPauseResume = () => {
    if (time === 0) {
      setIsActive(true);
      setIsPaused(false);
      setStartOrResume('Resume Session');
    } else {
      setIsPaused((prevIsPaused) => !prevIsPaused);
    }
  };

  const addAudioUrl = (blob: Blob) => {
    /*
    trim blob to ~12 seconds.
    the start and end args to Blob.slice are in bytes, 200000 is ~12 seconds of audio.
    found this by trial and error, def room for improvement here!
    */
    const newBlob: Blob = blob.slice(0, 200000);
    const url = URL.createObjectURL(newBlob);
    setUrl(url);
  };

  const deleteTake = (url: string) => {
    setUrl('');
  };

  console.log('logging url:', url);
  return (
    <Flex direction="column" align="center" mt="6rem">
      <Button
        colorScheme={!isPaused ? 'red' : 'green'}
        size="lg"
        m="1.5rem"
        onClick={handleStartPauseResume}
      >
        {!isPaused && time ? 'Pause Session' : startOrResume}
      </Button>
      <Heading>
        <DurationTimer time={time} durationRef={durationRef} />
      </Heading>
      <Text>didn’t use timer? you can edit this number when you save.</Text>
      <Textarea
        ref={notesRef}
        m="3rem 3rem 1rem 3rem"
        bg="white"
        placeholder="Take notes about your session here..."
      />
      <Flex direction="column" align="center">
        <Text fontSize="md">optionally tap mic to capture an audio take!</Text>
        <Text fontSize="sm" as="i">
          {'(takes will be trimmed to 12 seconds)'}
        </Text>
        <Box m="1rem">
          {url.length === 0 ? (
            <RecordAudio addAudioUrl={addAudioUrl} />
          ) : (
            <AudioDisplay
              url={url}
              deleteTake={deleteTake}
              context={'Practice'}
            />
          )}
        </Box>
      </Flex>
      <SaveSessionModal
        notesRef={notesRef}
        durationRef={durationRef}
        url={url}
      />
    </Flex>
  );
};

export default Practice;
