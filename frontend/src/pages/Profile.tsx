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
} from '@chakra-ui/react';
import { dummyMemberOne, Member } from '../dummyData/dummyData';
import { FaGasPump, FaChartLine, FaClock } from 'react-icons/fa6';
import { ImFire } from 'react-icons/im';
import { useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import Footer from './components/Footer';

const Profile = () => {
  const initRender = useOutletContext() as RenderPayloadDTO;
  const musician = initRender.musician;

  return (
    <Flex direction="column" align="center" maxW="35rem">
      <Footer />
      <Flex direction="column" align="center" p="1.5rem">
        <Avatar size="lg" name="User Name" />
        <Text mt="1rem">Member since: {musician.createdAt.toString()}</Text>
        <Text>Other metadata here? (instruments? genres?)</Text>
      </Flex>
      <Card m="3rem">
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
