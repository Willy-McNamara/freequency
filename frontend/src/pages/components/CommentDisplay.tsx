import React from 'react';
import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import { CommentDto } from '../../types/sessions.types';

interface CommentDisplayProps {
  comment: CommentDto;
}

const CommentDisplay = ({ comment }: CommentDisplayProps) => {
  return (
    <Flex direction="row" key={comment.id} mb="20px">
      <Avatar
        size="sm"
        name={comment.musician.displayName}
        src={comment.musician.profilePictureUrl}
      />
      <Flex direction="column" alignItems="left" ml="10px">
        <Heading size="xs">{comment.musician.displayName}</Heading>
        <Text fontSize="sm" maxW="30rem">
          {comment.text}
        </Text>{' '}
        {/* maxW is based off the post width, 35rem */}
      </Flex>
    </Flex>
  );
};

export default CommentDisplay;
