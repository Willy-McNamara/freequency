import React from 'react';
import {
  Flex,
  Box,
  Card,
  Avatar,
  Text,
  CardHeader,
  Heading,
  CardBody,
  List,
  ListItem,
  ListIcon,
  CardFooter,
  Stack,
  Badge,
} from '@chakra-ui/react';
import { dummyMemberOne, Member } from '../dummyData/dummyData';
import { FaGasPump, FaChartLine, FaClock } from 'react-icons/fa6';
import { ImFire } from 'react-icons/im';
import { useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import Footer from './components/Footer';
import InstrumentBadgeStack from './components/InstrumentBadgeStack';
import EditProfileModal from './components/EditProfileModal';

const Profile = () => {
  const initRender = useOutletContext() as RenderPayloadDTO;
  const musician = initRender.musician;

  return (
    <Flex direction="column" align="center" maxW="35rem">
      <Footer />
      <Flex direction="column" align="center" p="1.5rem">
        <EditProfileModal
          displayName={musician.displayName}
          initialInstruments={musician.instruments}
          bio={musician.bio}
        />
        <Avatar size="xl" name="User Name" />
        <Heading size="xl">{musician.displayName}</Heading>
        <Stack spacing="4">
          <Card variant="unstyled">
            <CardHeader>
              <Heading size="sm"> Member since:</Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm">
                {new Date(musician.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </CardBody>
          </Card>
        </Stack>
        <Stack spacing={0.5} mt="5px">
          <Text>
            <Text as="span" textDecoration="underline">
              Member since:
            </Text>{' '}
            {new Date(musician.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text>
            <Text as="span" textDecoration="underline">
              Instrument:
            </Text>{' '}
            <InstrumentBadgeStack instruments={musician.instruments} />
          </Text>
          <Text>
            <Text as="span" textDecoration="underline">
              Bio:
            </Text>{' '}
            {musician.bio}
          </Text>
        </Stack>
      </Flex>
      <Card m="1rem">
        <CardHeader>
          <Heading size="md">
            Take a moment to appreciate your progress...
          </Heading>
        </CardHeader>
        <CardBody>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={FaChartLine} color="green.500" />
              Logged {musician.totalSessions} sessions
            </ListItem>
            <ListItem>
              <ListIcon as={FaClock} color="blue.500" />
              Spent {musician.totalPracticeMinutes} minutes practicing
            </ListItem>
            <ListItem>
              <ListIcon as={ImFire} color="red.500" />
              Recieved {musician.totalGasUps} gas ups
            </ListItem>
            {/* Need to update schema to account for giving/getting GasUps */}
            <ListItem>
              <ListIcon as={FaGasPump} color="brown.500" />
              Given out {4} gas ups
            </ListItem>
          </List>
        </CardBody>
        <CardFooter>
          <Heading size="md">Keep it up!</Heading>
        </CardFooter>
      </Card>
    </Flex>
  );
};

export default Profile;
