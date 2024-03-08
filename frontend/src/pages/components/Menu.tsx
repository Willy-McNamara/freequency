import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Heading, Icon } from '@chakra-ui/react';
import { TbHandRock } from 'react-icons/tb';
import { CgProfile } from 'react-icons/cg';
import { PiMusicNotesFill } from 'react-icons/pi';

const Menu = () => {
  return (
    <Flex
      position="fixed"
      left="150px"
      top="40%"
      transform="translateX(-50%)"
      direction="column"
      alignItems="left"
    >
      <Link to="feed">
        <Flex direction="row" align="center" m="0.25rem">
          <Icon as={TbHandRock} boxSize="3em" mr="0.5rem"></Icon>
          <Heading>Feed</Heading>
        </Flex>
      </Link>
      <Link to="profile">
        <Flex direction="row" align="center" m="0.25rem">
          <Icon as={CgProfile} boxSize="3em" mr="0.5rem"></Icon>
          <Heading>Profile</Heading>
        </Flex>
      </Link>
      <Link to="practice">
        <Flex direction="row" align="center" m="0.25rem">
          <Icon as={PiMusicNotesFill} boxSize="3em" mr="0.5rem"></Icon>
          <Heading>Practice</Heading>
        </Flex>
      </Link>
    </Flex>
  );
};

export default Menu;
