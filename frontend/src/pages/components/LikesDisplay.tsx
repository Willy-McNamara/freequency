import React from 'react';
import { Flex, Avatar, Box, Text, Button } from '@chakra-ui/react';
import { GasUpDto } from '../../types/sessions.types';

interface LikesDisplayProps {
  gasUps: GasUpDto[]; // Assuming gasUps are represented by user IDs or usernames
}

const LikesDisplay = ({ gasUps }: LikesDisplayProps) => {
  const maxAvatars = 3;
  const offsetPercentage = 8;

  // Slice the likes array to get a maximum of 3 likers
  const visibleLikes = gasUps.slice(0, maxAvatars);

  return (
    <Flex alignItems="center">
      {visibleLikes.map((liker, index) => (
        <Box
          key={liker.id}
          position="relative"
          marginLeft={index !== 0 ? `-${offsetPercentage}%` : 0}
          zIndex={index + 1} // Increase zIndex for each Avatar to layer them
        >
          <Avatar
            name={liker.musicianDisplayName}
            size="xs"
            border="2px white solid"
          />
        </Box>
      ))}
      {gasUps.length > maxAvatars && (
        <Button ml="0.25rem" as="i" variant="link" fontWeight="normal">
          {gasUps.length} gas ups
        </Button>
      )}
    </Flex>
  );
};

export default LikesDisplay;
