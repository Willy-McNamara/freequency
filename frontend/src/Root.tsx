import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Flex, Box, Heading, Icon } from '@chakra-ui/react';
import { TbHandRock } from 'react-icons/tb';
import { CgProfile } from 'react-icons/cg';
import { PiMusicNotesFill } from 'react-icons/pi';

const Root = () => {
  return (
    <Flex direction="column" align="center">
      <Flex
        position="absolute"
        left="2vw"
        top="30vh"
        direction="column"
        align="left"
      >
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
      <Outlet />
    </Flex>
  );
};

export default Root;
