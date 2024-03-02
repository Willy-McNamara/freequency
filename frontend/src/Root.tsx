import React, { useEffect } from 'react';
import { Link, Outlet, useLoaderData, useNavigate } from 'react-router-dom';
import { Flex, Box, Heading, Icon } from '@chakra-ui/react';
import { TbHandRock } from 'react-icons/tb';
import { CgProfile } from 'react-icons/cg';
import { PiMusicNotesFill } from 'react-icons/pi';
import { RenderPayloadDTO } from './types/app.types';

const Root = () => {
  /*
  probably keep state here for loader data? this way the pagination can update state in
  this Root, saving the users place if they nav away from the feed and back to it again
  */
  const navigate = useNavigate();

  const initPayload = useLoaderData() as RenderPayloadDTO | string;

  useEffect(() => {
    if (typeof initPayload === 'string') {
      console.log('should navigate to login');
      navigate('/login');
    }
  }, []);
  console.log('log loader data in Root :', initPayload);

  if (typeof initPayload === 'string') {
    return <></>;
  } else {
    return (
      <Flex
        direction="column"
        align="center"
        bgColor="#f7f7e9"
        minHeight="100vh"
      >
        <Flex position="absolute" left="2vw" top="30vh" direction="column">
          <Link to="Feed">
            <Flex direction="row" align="center" m="0.25rem">
              <Icon as={TbHandRock} boxSize="3em" mr="0.5rem"></Icon>
              <Heading>Feed</Heading>
            </Flex>
          </Link>
          <Link to="Profile">
            <Flex direction="row" align="center" m="0.25rem">
              <Icon as={CgProfile} boxSize="3em" mr="0.5rem"></Icon>
              <Heading>Profile</Heading>
            </Flex>
          </Link>
          <Link to="Practice">
            <Flex direction="row" align="center" m="0.25rem">
              <Icon as={PiMusicNotesFill} boxSize="3em" mr="0.5rem"></Icon>
              <Heading>Practice</Heading>
            </Flex>
          </Link>
        </Flex>
        <Box m="3.5rem"></Box>
        <Outlet context={initPayload} />
      </Flex>
    );
  }
};

export default Root;
