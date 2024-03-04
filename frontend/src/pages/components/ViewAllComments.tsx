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
import { xCommentDto } from '../../types/sessions.types';
import CommentDisplay from './CommentDisplay';

interface ViewAllCommentsProps {
  handleNewComment: (newComment: xCommentDto) => void;
  commentList: xCommentDto[];
}

const ViewAllComments = ({
  handleNewComment,
  commentList,
}: ViewAllCommentsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen} variant="link">
        <Text fontSize="xs" as="i" mb="1rem">
          View all comments...
        </Text>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
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
