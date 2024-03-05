import {
  Button,
  Flex,
  Textarea,
  Text,
  IconButton,
  Heading,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaVideo } from 'react-icons/fa6';
import SaveSessionModal from './components/SaveSessionModal';
import DurationTimer from './components/DurationTimer';

const Practice = () => {
  const notesRef = useRef(null);
  const [startOrResume, setStartOrResume] = useState('Start Session');
  const durationRef = useRef(null);

  // new implentation of timer

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);

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

  return (
    <Flex direction="column" align="center">
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
        m="3rem"
        bg="white"
        placeholder="Take notes about your session here..."
      />
      <Flex direction="row" align="center">
        <Text>tap to capture an audio or video take</Text>
        <IconButton
          variant="ghost"
          colorScheme="gray"
          aria-label="Record Audio"
          icon={<FaMicrophone />}
        ></IconButton>
        <IconButton
          variant="ghost"
          colorScheme="gray"
          aria-label="Record Video"
          icon={<FaVideo />}
        ></IconButton>
      </Flex>
      <SaveSessionModal notesRef={notesRef} durationRef={durationRef} />
    </Flex>
  );
};

export default Practice;
