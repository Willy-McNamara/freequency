import React from 'react';
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import LikesDisplay from './LikesDisplay';
import { GasUpDto } from '../../types/sessions.types';
import LikeDisplay from './LikeDisplay';

interface ViewAllLikesProps {
  gasUps: GasUpDto[];
}

const ViewAllLikes = ({ gasUps }: ViewAllLikesProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <div
        onClick={onOpen}
        style={{
          cursor: 'pointer',
        }}
      >
        <LikesDisplay gasUps={gasUps} />
      </div>

      <Modal
        isOpen={isOpen}
        size="sm"
        scrollBehavior="inside"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>fan club</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {gasUps.map((gasUp) => (
              <LikeDisplay gasUp={gasUp} />
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewAllLikes;
