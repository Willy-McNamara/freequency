import React, { useRef, useState } from 'react';
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberDecrementStepper,
  Checkbox,
  Stack,
  Flex,
  Center,
  useToast,
  useBoolean,
} from '@chakra-ui/react';
import axios from 'axios';

const SaveSessionModal = ({ notesRef, minutesPracticed }) => {
  console.log('logging notesRef in modal', notesRef);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sessionTitleRef = useRef(null);
  const [hasTitle, setHasTitle] = useState(true);
  const [minutes, setMinutes] = useState(minutesPracticed);
  const [isPublic, setIsPublic] = useBoolean(true);
  const toast = useToast();
  const toastId = 'active';

  console.log('no error yet');
  let [notes, setNotes] = useState('');
  console.log('reached');

  let handleInputChange = (e: { target: { value: any } }) => {
    let inputValue = e.target.value;
    setNotes(inputValue);
  };

  return (
    <>
      <Button
        onClick={() => {
          if (!notesRef.current.value) {
            setNotes('no notes for session...');
          } else {
            setNotes(notesRef.current.value);
          }
          onOpen();
        }}
        m="1rem"
        colorScheme="green"
        size="md"
      >
        save session
      </Button>
      <Modal
        isOpen={isOpen}
        initialFocusRef={sessionTitleRef}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader alignSelf="center">confirm the deets...</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!hasTitle}>
              <Input
                ref={sessionTitleRef}
                placeholder="Title your session..."
              />
            </FormControl>

            <FormControl mt={4}>
              <Textarea value={notes} onChange={handleInputChange} size="md" />
            </FormControl>
            <FormControl mt={4}>
              <Center>
                <Flex align="center">
                  <NumberInput
                    defaultValue={minutes}
                    value={minutes}
                    onChange={(e) => {
                      setMinutes(e);
                    }}
                    min={1}
                    max={1440}
                    w="80px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormLabel ml={2} mb={0}>
                    minutes practiced
                  </FormLabel>
                </Flex>
              </Center>
            </FormControl>
            <Stack align="center" justify="center" mt={4}>
              <Checkbox isChecked={isPublic} onChange={setIsPublic.toggle}>
                share to feed?
              </Checkbox>
            </Stack>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              colorScheme="green"
              onClick={() => {
                if (sessionTitleRef.current.value.length === 0) {
                  setHasTitle(false);
                  return;
                } else {
                  setHasTitle(true);
                }

                const newSessionPayload = {
                  title: sessionTitleRef.current.value,
                  notes: notes,
                  duration: minutes,
                  isPublic: isPublic,
                  musicianId: '1', // placeholder for musicianId, eventually get from Auth
                };

                console.log('logging newSessionPayload :', newSessionPayload);

                // create an axios post request to save the session
                const saveSession = axios
                  .post('http://localhost:3000/sessions', newSessionPayload)
                  .then((res) => {
                    console.log(
                      'logging response from save session modal :',
                      res,
                    );
                    onClose();
                  })
                  .catch((err) => {
                    console.log('logging error from save session modal :', err);
                  });

                // placeholder for async api call...
                // const examplePromise = new Promise((resolve, reject) => {
                //   setTimeout(() => {
                //     resolve(200);
                //     onClose();
                //   }, 5000);
                // });

                if (!toast.isActive(toastId)) {
                  toast.promise(saveSession, {
                    success: {
                      title: 'session saved.',
                      description: 'way to go!',
                      id: toastId,
                    },
                    error: {
                      title: 'uh oh...',
                      description: 'something went wrong! please try again',
                      id: toastId,
                    },
                    loading: {
                      title: 'saving your session...',
                      description: `maybe take a deep breath or somethin'?`,
                      id: toastId,
                    },
                  });
                }
              }}
            >
              save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SaveSessionModal;
