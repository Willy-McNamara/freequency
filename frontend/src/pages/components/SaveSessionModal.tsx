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
import { useNavigate, useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../../types/app.types';
import InstrumentBadgeWrapEditable from './InstrumentBadgeWrapEditable';
import { PopularInstrument } from '../../types/instruments.types';
import AudioDisplay from './AudioDisplay';
import { computeSHA256 } from '../../utils/checksum';
import DOMPurify from 'dompurify';

interface Props {
  durationRef: React.RefObject<any>;
  tipTapRef: React.RefObject<any>;
  url: string;
  blob: Blob | null;
}

const SaveSessionModal = ({ durationRef, url, blob, tipTapRef }: Props) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sessionTitleRef = useRef(null);
  const [hasTitle, setHasTitle] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [isPublic, setIsPublic] = useBoolean(true);
  const toast = useToast();
  const toastId = 'active';

  const loaderData = useOutletContext() as RenderPayloadDTO;

  const instrumentsList = loaderData.musician.instruments;
  const isEmpty = instrumentsList.length === 0;
  const [instruments, setInstruments] = useState<PopularInstrument[]>(
    !isEmpty ? [instrumentsList[0]] : [],
  );

  const toggleInstrument = (instrument: PopularInstrument) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((item) => item !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const updatePracticeTime = () => {
    const convertTimeStringToMinutes = (timeString: string): number => {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);

      const totalMinutes = hours * 60 + minutes + Math.floor(seconds / 60);

      return totalMinutes;
    };
    const minutes = convertTimeStringToMinutes(
      durationRef?.current?.textContent,
    );
    setMinutes(minutes);
  };

  return (
    <>
      <Button
        onClick={() => {
          updatePracticeTime();
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
            <Flex mt={4} p="0 1rem 0 1rem" maxH="10rem" overflow="auto">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    DOMPurify.sanitize(tipTapRef.current?.textContent) !==
                    '<p>Take notes about your session here...</p>'
                      ? DOMPurify.sanitize(tipTapRef.current?.textContent)
                      : 'No notes for this session!',
                }}
                className="tiptap"
              />
            </Flex>

            {url.length !== 0 && (
              <Flex align="center" m="1rem">
                <AudioDisplay url={url} context="SaveSessionModal" />
              </Flex>
            )}
            <Stack align="center" justify="center" mt={3}>
              {!isEmpty && (
                <InstrumentBadgeWrapEditable
                  toggleInstrument={toggleInstrument}
                  initialInstruments={instruments}
                  instrumentList={instrumentsList}
                />
              )}
              <FormControl mt={1}>
                <Center>
                  <Flex align="center">
                    <NumberInput
                      defaultValue={minutes}
                      value={minutes}
                      onChange={(e) => {
                        setMinutes(Number(e));
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
            </Stack>
            <Stack align="center" justify="center" mt={4}>
              <Checkbox isChecked={isPublic} onChange={setIsPublic.toggle}>
                share to feed?
              </Checkbox>
            </Stack>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              colorScheme="green"
              onClick={async () => {
                if (sessionTitleRef.current.value.length === 0) {
                  setHasTitle(false);
                  return;
                } else {
                  setHasTitle(true);
                }

                let saveSession: Promise<any>;

                // conditional upon url '' / there being a blob
                // for scenarios where a user saves a session with no audio
                if (!blob) {
                  const newSessionPayload = {
                    title: sessionTitleRef.current.value,
                    notes: DOMPurify.sanitize(tipTapRef.current?.textContent),
                    instruments: instruments,
                    duration: minutes,
                    isPublic: isPublic,
                  };

                  saveSession = axios
                    .post(`/sessions/newSessionWithoutAudio`, newSessionPayload)
                    .then((res) => {
                      // refresh or redirect to feed with a refresh to see the new post?
                      onClose();
                      return Promise.resolve(res);
                    })
                    .catch((err) => {
                      if (err.response.status === 401) {
                        // Redirect to login if unauthorized
                        navigate('/login');
                      }
                      return Promise.reject(err);
                    });
                } else {
                  const file = new File([blob], sessionTitleRef.current.value, {
                    type: 'audio/webm;codecs=opus',
                  });

                  const audioPayload = {
                    fileSize: file.size, // file.size
                    fileType: 'audio/webm;codecs=opus', // file.type
                    checksum: await computeSHA256(file),
                  };

                  const newSessionPayload = {
                    title: sessionTitleRef.current.value,
                    notes: DOMPurify.sanitize(tipTapRef.current?.textContent),
                    instruments: instruments,
                    duration: minutes,
                    isPublic: isPublic,
                    audioPayload: audioPayload,
                  };
                  let mediaId: number;
                  let sessionId: number;
                  // create an axios post request to save the session
                  saveSession = axios
                    .post(`/sessions/newSessionWithAudio`, newSessionPayload)
                    .then((res) => {
                      mediaId = res.data.newMedia.id;
                      sessionId = res.data.newSession.id;
                      const url = res.data.signedUrl;
                      return axios.put(url, file, {
                        headers: {
                          'Content-Type': file.type,
                        },
                      });
                    })
                    .then((s3Res) => {
                      // post confirmation of success to api to link media and session
                      return axios.post(`/sessions/confirmMedia`, {
                        mediaId: mediaId,
                        sessionId: sessionId,
                      });
                    })
                    .then((res) => {
                      // refresh or redirect to feed with a refresh to see the new post?
                      onClose();
                      return Promise.resolve(res);
                    })
                    .catch((err) => {
                      if (err.response.status === 401) {
                        // Redirect to login if unauthorized
                        navigate('/login');
                      }
                      return Promise.reject(err);
                    });
                }

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
