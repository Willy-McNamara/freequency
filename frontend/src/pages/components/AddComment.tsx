import React from 'react';
import { useState, useRef } from 'react';
import {
  CardFooter,
  Flex,
  Divider,
  Avatar,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import { IoIosSend } from 'react-icons/io';
import {
  mockComment,
  CommentDto,
  AddCommentDto,
} from '../../types/sessions.types';
import axios from 'axios';

interface AddCommentProps {
  handleNewComment: (newComment: CommentDto) => void;
  sessionId: number;
}

const AddComment = ({ handleNewComment, sessionId }: AddCommentProps) => {
  const textareaRef = useRef(null);
  const [isProcessing, setProcessing] = useState(false);

  const handlePostRequest = () => {
    const text = textareaRef.current.value;

    const newComment: AddCommentDto = {
      text,
      sessionId,
    };

    // Disable the component and mock the post request using setTimeout
    setProcessing(true);
    setTimeout(() => {
      // Reset the disabled state after the mock request is complete
      setProcessing(false);

      axios
        .post('/sessions/addComment', newComment)
        .then((response) => {
          // this would be in the .then of the actual post request
          handleNewComment(response.data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }, 1000); // Mocking a 1-second delay
  };

  return (
    <CardFooter
      p="0 1.5rem 0.75rem"
      opacity={isProcessing ? 0.5 : 1}
      pointerEvents={isProcessing ? 'none' : 'auto'}
    >
      <Flex direction="column" align="left" w="100%">
        <Divider mb="1rem" w="100%" />
        <Flex direction="row" justifyContent="space-between" w="100%">
          <Flex direction="row" align="center" w="100%">
            <Avatar size="sm" name="User Icon" />
            <Textarea
              ref={textareaRef}
              placeholder="Where do I even begin..."
              resize="none"
              ml="10px"
              w="100%"
            />
          </Flex>
          <IconButton
            aria-label="Add comment"
            size="sm"
            icon={<IoIosSend />}
            onClick={handlePostRequest}
            isDisabled={isProcessing}
            m="0 0 0 0.5rem"
          />
        </Flex>
      </Flex>
    </CardFooter>
  );
};

export default AddComment;
