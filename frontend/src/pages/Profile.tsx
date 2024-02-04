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
import { CiClock1 } from 'react-icons/ci';

const Profile = () => {
  return (
    <Flex direction="column" align="center" maxW="35rem">
      <Flex direction="column" align="center" p="1.5rem">
        <Avatar size="lg" name="User Name" />
        <Text mt="1rem">
          Member since: {dummyMemberOne.memberSince.toString()}
        </Text>
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
              Logged ___ sessions
            </ListItem>
            <ListItem>
              <ListIcon as={FaClock} color="blue.500" />
              Spent ___ minutes practicing
            </ListItem>
            <ListItem>
              <ListIcon as={ImFire} color="red.500" />
              Recieved ___ gas ups
            </ListItem>
            {/* You can also use custom icons from react-icons */}
            <ListItem>
              <ListIcon as={FaGasPump} color="brown.500" />
              Given out ___ gas ups
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
