import React, { useEffect } from 'react';
import { Link, Outlet, useLoaderData, useNavigate } from 'react-router-dom';
import { Flex, Box, Heading, Icon } from '@chakra-ui/react';
import { TbHandRock } from 'react-icons/tb';
import { CgProfile } from 'react-icons/cg';
import { PiMusicNotesFill } from 'react-icons/pi';
import { RenderPayloadDTO } from './types/app.types';
import PrivacyPolicy from './pages/components/PrivacyPolicy';
import Footer from './pages/components/Footer';
import Menu from './pages/components/Menu';

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
        <Menu />
        <Box m="1rem"></Box>
        <Outlet context={initPayload} />
      </Flex>
    );
  }
};

export default Root;
