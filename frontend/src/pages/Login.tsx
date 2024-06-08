import React from 'react';
import { Flex, Heading, Divider, Text } from '@chakra-ui/react';
import GoogleButton from 'react-google-button';
import Logo from './components/Logo';
import Footer from './components/Footer';

const Login = () => {
  const handleGoogleButtonClick = () => {
    window.location.href = `/auth/login`;
  };
  return (
    <Flex
      direction="column"
      align="center"
      justifyContent="center"
      bgColor="#f3fbe9" //#f7f7e9
      minHeight="100vh"
    >
      <Logo />
      <Heading size="3xl">Welcome to freequency!</Heading>
      <Text fontSize="2xl">a community around practice</Text>
      <Flex direction="column" align="center">
        <Divider m="2rem" size="large" />
        <GoogleButton onClick={handleGoogleButtonClick} />
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Login;
