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
} from '@chakra-ui/react';
import { FaRegEdit } from 'react-icons/fa';
import InstrumentBadgeWrapEditable from './InstrumentBadgeWrapEditable';
import { PopularInstrument } from '../../types/instruments.types';

interface Props {
  displayName: string;
  initialInstruments: PopularInstrument[];
  bio: string;
}

const EditProfileModal = ({ displayName, initialInstruments, bio }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [instruments, setInstruments] = useState<string[]>(initialInstruments);

  const displayNameRef = useRef(null);
  const bioRef = useRef(null);

  const toggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((item) => item !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const handleClose = () => {
    const updateProfilePayload = {
      updatedDisplayName: displayNameRef?.current?.textContent || displayName,
      updatedInstruments: instruments || [],
      updatedBio: bioRef?.current?.textContent || bio,
    };

    console.log('logging updated profile info on close', updateProfilePayload);
    // call API with update info!

    onClose();
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
            <Box h="20px" />
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
            <Editable defaultValue={bio} ref={bioRef}>
              <EditablePreview />
              <EditableTextarea />
            </Editable>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
