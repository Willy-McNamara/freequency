import React from 'react';
import { feedPost } from '../../dummyData/dummyData';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Flex,
  Heading,
  Text,
  IconButton,
  CardBody,
  Image,
  CardFooter,
  Button,
  Badge,
} from '@chakra-ui/react';
import { ChatIcon, ArrowUpIcon } from '@chakra-ui/icons';

type props = {
  post: feedPost;
};

const Post = ({ post }: props) => {
  return (
    <Card w="35rem" m="1.5rem">
      <CardHeader pb="0">
        <Flex direction="column">
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name="User Icon" />
            <Heading size="sm">{post.username}</Heading>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody pt="0">
        <Text p="0.5rem 0px 0.5rem" fontSize="xl">
          {post.sessionTitle} | {post.sessionDuration} minutes
        </Text>
        <Text>{post.sessionNotes}</Text>
      </CardBody>
      <Badge colorScheme="green"> Audio or Video, recorded take here</Badge>

      <CardFooter
        justify="space-between"
        flexWrap="wrap"
        sx={{
          '& > button': {
            minW: '136px',
          },
        }}
      >
        <Button flex="1" variant="ghost" leftIcon={<ArrowUpIcon />}>
          Gas Up
        </Button>
        <Button flex="1" variant="ghost" leftIcon={<ChatIcon />}>
          Comment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Post;
