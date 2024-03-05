import React from 'react';
import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import { GasUpDto } from '../../types/sessions.types';

interface LikeDisplayProps {
  gasUp: GasUpDto;
}

const LikeDisplay = ({ gasUp }: LikeDisplayProps) => {
  return (
    <Flex direction="row" align="center" mb="20px">
      <Avatar size="sm" name="User Icon" />
      <Heading ml="1rem" size="xs">
        {gasUp.musicianDisplayName}
      </Heading>
    </Flex>
  );
};

export default LikeDisplay;
