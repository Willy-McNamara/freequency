import React, { useRef, useState } from 'react';
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  EditableTextarea,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Stack,
  Text,
  Box,
  useToast,
} from '@chakra-ui/react';
import { FaRegEdit } from 'react-icons/fa';
import InstrumentBadgeWrapEditable from './InstrumentBadgeWrapEditable';
import { PopularInstrument } from '../../types/instruments.types';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router';

interface Props {
  displayName: string;
  initialInstruments: PopularInstrument[];
  bio: string;
}

const EditProfileModal = ({ displayName, initialInstruments, bio }: Props) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [instruments, setInstruments] = useState<string[]>(initialInstruments);

  const displayNameRef = useRef(null);
  const bioRef = useRef(null);

  const toast = useToast();
  const toastId = 'active';

  const toggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((item) => item !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const handleClose = () => {
    const updateProfilePayload = {
      updatedDisplayName:
        DOMPurify.sanitize(displayNameRef?.current?.textContent) || displayName,
      updatedInstruments: (instruments as string[]) || [],
      updatedBio: DOMPurify.sanitize(bioRef?.current?.textContent) || bio,
    };

    // const examplePromise = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(200);
    //     onClose();
    //   }, 5000);
    // });
    const updateProfile = axios
      .post(`/musicians/update`, updateProfilePayload)
      .then((res) => {
        onClose();
        window.location.reload();
        return Promise.resolve(res);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
        }
        return Promise.reject(err);
      });

    if (!toast.isActive(toastId)) {
      toast.promise(updateProfile, {
        success: {
          title: 'profile updated.',
          description: 'a whole new you',
          id: toastId,
        },
        error: {
          title: 'uh oh...',
          description: 'something went wrong! please try again',
          id: toastId,
        },
        loading: {
          title: 'udpating your profile...',
          description: `werkin on it!`,
          id: toastId,
        },
      });
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        position="fixed"
        left="75%"
        top="20px"
        transform="translateX(-50%)"
        leftIcon={<FaRegEdit />}
        variant="ghost"
      >
        Edit
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update your info</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box h="15px" />
            <Stack direction="row" alignItems="center">
              <Heading size="xs">Display name</Heading>
              <Text fontSize="xs" as="i">
                (edit inline)
              </Text>
            </Stack>
            <Editable defaultValue={displayName} ref={displayNameRef}>
              <EditablePreview />
              <EditableInput />
            </Editable>
            <Box h="20px" />
            <Stack direction="row" alignItems="center">
              <Heading size="xs" mb="5px">
                Instruments
              </Heading>
              <Text fontSize="xs" as="i">
                (toggle to add or remove)
              </Text>
            </Stack>

            <InstrumentBadgeWrapEditable
              initialInstruments={instruments as PopularInstrument[]}
              toggleInstrument={toggleInstrument}
            />
            <Box h="20px" />
            <Stack direction="row" alignItems="center">
              <Heading size="xs">Bio</Heading>
              <Text fontSize="xs" as="i">
                (edit inline)
              </Text>
            </Stack>
            <Editable defaultValue={bio}>
              <EditablePreview ref={bioRef} />
              <EditableTextarea />
            </Editable>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="green" mr={3} onClick={handleClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
