import React from 'react';
import { Flex, Heading, Text, Image } from '@chakra-ui/react';

const Logo = () => {
  return (
    <Flex direction="row" position="absolute" top="1rem" left="1rem">
      {/* <Image src="freequencyLogo.png" alt="logo" boxSize="100px" /> */}
      <Flex direction="column" align="center" justifyContent="center">
        <Heading size="xl">freequency</Heading>
        <Text fontSize="l">celebrate practice</Text>
      </Flex>
    </Flex>
  );
};

export default Logo;
