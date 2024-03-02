import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

const Logo = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justifyContent="center"
      position="absolute"
      top="1rem"
      left="1rem"
    >
      <Heading size="xl">freequency</Heading>
      <Text fontSize="l">celebrate practice</Text>
    </Flex>
  );
};

export default Logo;
