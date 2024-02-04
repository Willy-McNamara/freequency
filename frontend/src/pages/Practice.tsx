import {
  Button,
  Flex,
  Textarea,
  Text,
  IconButton,
  Heading,
} from '@chakra-ui/react';
import React from 'react';
import { FaMicrophone, FaVideo } from 'react-icons/fa6';

const Practice = () => {
  return (
    <Flex direction="column" align="center">
      <Button colorScheme="green" size="lg" m="1.5rem">
        Start Session
      </Button>
      <Heading>00:01</Heading>
      <Text>didn’t use timer? you can edit this number when you save.</Text>
      <Textarea m="3rem" placeholder="Take notes about your session here..." />
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
      <Button m="1rem" colorScheme="green" size="md">
        save session
      </Button>
    </Flex>
  );
};

export default Practice;
