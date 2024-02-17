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

const Practice = () => {
  const notesRef = useRef(null);
  // placeholder minutes until implement timer
  const [minutesPracticed, setMinutesPracticed] = useState(23);

  return (
    <Flex direction="column" align="center">
      <Button colorScheme="green" size="lg" m="1.5rem">
        Start Session
      </Button>
      <Heading>00:01</Heading>
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
      <SaveSessionModal
        notesRef={notesRef}
        minutesPracticed={minutesPracticed}
      />
    </Flex>
  );
};

export default Practice;
