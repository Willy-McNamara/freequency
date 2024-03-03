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
  Link,
  Stack,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const Contact = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} colorScheme="black" variant="link" m="8px">
        Contact
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Please send any feedback, questions, suggestions, and inquiries to{' '}
              <Text as="span" textDecoration="underline" fontWeight="bold">
                freequency.app@gmail.com
              </Text>
              .
            </Text>

            <Stack spacing={4} mt="10px">
              <Link
                margin="5px"
                href="https://www.linkedin.com/in/willymcnamara/"
                isExternal
              >
                Connect on LinkedIn <ExternalLinkIcon mx="2px" />
              </Link>

              <Link
                margin="5px"
                href="https://www.buymeacoffee.com/willymcnamara"
                isExternal
              >
                Support the app! <ExternalLinkIcon mx="2px" />
              </Link>

              <Text as="b">Thank you!</Text>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Contact;
