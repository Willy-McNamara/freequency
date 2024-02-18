import {
  Button,
  Flex,
  Textarea,
  Text,
  IconButton,
  Heading,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { FaMicrophone, FaVideo } from 'react-icons/fa6';
import SaveSessionModal from './components/SaveSessionModal';
import DurationTimer from './components/CountUpTimer';
import moment from 'moment';

const Practice = () => {
  const notesRef = useRef(null);
  // placeholder minutes until implement timer
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [startOrResume, setStartOrResume] = useState('Start Session');
  const durationRef = useRef(null);

  const handleStartStop = () => {
    if (startTime === 0) {
      setStartTime(moment().unix());
      setStartOrResume('Resume Session');
    }
    setIsRunning(!isRunning);
  };

  return (
    <Flex direction="column" align="center">
      <Button
        colorScheme={isRunning ? 'red' : 'green'}
        size="lg"
        m="1.5rem"
        onClick={handleStartStop}
      >
        {isRunning && startTime ? 'Pause Session' : startOrResume}
      </Button>
      <Heading>
        <DurationTimer
          startTime={startTime}
          isRunning={isRunning}
          durationRef={durationRef}
        />
      </Heading>
      <Text>didn’t use timer? you can edit this number when you save.</Text>
      <Textarea
        ref={notesRef}
        m="3rem"
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
