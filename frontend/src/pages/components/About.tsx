import React from 'react';
import {
  Button,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';

const About = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} colorScheme="black" variant="link" m="8px">
        About
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {' '}
              freequency is a place to track, record, and celebrate practice!{' '}
            </Text>
            <Text>
              {' '}
              Log sessions using the Practice tab. Here you can include notes
              about your session, the duration of your session, and an optional
              recording. You can choose to share this publicly, or keep it for
              your eyes only.{' '}
            </Text>
            <Text>
              {' '}
              Check out the Feed tab to view your sessions and sessions from all
              around the community. Celebrate practice by leaving a comment or
              gassing up a fellow musician.{' '}
            </Text>
            <Text>
              {' '}
              See your progress and account infomration in the Profile tab.
              Update your avatar and details at time.{' '}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default About;
