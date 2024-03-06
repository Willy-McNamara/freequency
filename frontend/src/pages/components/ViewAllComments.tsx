import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import AddComment from './AddComment';
import { CommentDto } from '../../types/sessions.types';
import CommentDisplay from './CommentDisplay';

interface ViewAllCommentsProps {
  handleNewComment: (newComment: CommentDto) => void;
  commentList: CommentDto[];
}

const ViewAllComments = ({
  handleNewComment,
  commentList,
}: ViewAllCommentsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen} variant="link" fontWeight="normal">
        <Text fontSize="xs" as="i" mb="1rem">
          View all comments...
        </Text>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>What the people are sayin'...</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {commentList.map((comment) => (
              <CommentDisplay comment={comment} />
            ))}
          </ModalBody>

          <AddComment handleNewComment={handleNewComment} />
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewAllComments;
