import React from 'react';
import { Flex, Divider, Center } from '@chakra-ui/react';
import Contact from './Contact';
import PrivacyPolicy from './PrivacyPolicy';
import About from './About';

const Footer = () => {
  return (
    <Flex
      position="fixed"
      left="50%"
      bottom="20px"
      transform="translateX(-50%)"
      direction="row"
      alignItems="center"
    >
      <About />
      <Center height="20px">
        <Divider color="black" orientation="vertical" />
      </Center>
      <PrivacyPolicy />
      <Center height="20px">
        <Divider color="black" orientation="vertical" />
      </Center>
      <Contact />
    </Flex>
  );
};

export default Footer;
