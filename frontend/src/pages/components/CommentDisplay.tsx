import React from 'react';
import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import { xCommentDto } from '../../types/sessions.types';

interface CommentDisplayProps {
  comment: xCommentDto;
}

const CommentDisplay = ({ comment }: CommentDisplayProps) => {
  return (
    <Flex direction="row" key={comment.id} mb="20px">
      <Avatar size="sm" name="User Icon" />
      <Flex direction="column" alignItems="left" ml="10px">
        <Heading size="xs">{comment.musicianDisplayName}</Heading>
        <Text fontSize="sm" maxW="30rem">
          {comment.text}
        </Text>{' '}
        {/* maxW is based off the post width, 35rem */}
      </Flex>
    </Flex>
  );
};

export default CommentDisplay;
