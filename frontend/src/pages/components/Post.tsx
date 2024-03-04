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
  useBoolean,
  Divider,
  Textarea,
} from '@chakra-ui/react';
import { ChatIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { FrontendSessionDto } from '../../types/sessions.types';
import { xCommentDto, mockComments } from '../../types/sessions.types';

type props = {
  post: FrontendSessionDto;
};

const Post = ({ post }: props) => {
  const [isOpen, setIsOpen] = useBoolean(false);
  // check if post has comments, if so, grab only the latest two
  const subComments: xCommentDto[] | null = true
    ? mockComments.slice(-2)
    : null;

  const toggleCommentBox = () => {
    console.log('comment box clicked');
    setIsOpen.toggle();
  };

  if (!post.isPublic) {
    return;
  }
  return (
    <Card w="35rem" m="1.5rem">
      <CardHeader pb="0">
        <Flex direction="column">
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name="User Icon" />
            <Heading size="sm">{post.musicianDisplayname}</Heading>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody pt="0">
        <Text p="0.5rem 0px 0.5rem" fontSize="xl">
          {post.title} | {post.duration} minutes
        </Text>
        <Text>{post.notes}</Text>
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
        p="0.5rem"
      >
        <Button flex="1" variant="ghost" leftIcon={<ArrowUpIcon />}>
          Gas Up
        </Button>
        <Button
          flex="1"
          variant="ghost"
          leftIcon={<ChatIcon />}
          onClick={toggleCommentBox}
        >
          Comment
        </Button>
      </CardFooter>
      {subComments && (
        <CardFooter p="0.25rem 1.5rem">
          <Flex direction="column" align="left">
            {subComments.map((comment) => (
              <Flex direction="row" key={comment.id} mb="20px">
                <Avatar size="sm" name="User Icon" />
                <Flex direction="column" alignItems="left" ml="10px">
                  <Heading size="xs">{comment.musicianDisplayName}</Heading>
                  <Text fontSize="sm" maxW="30rem">
                    {comment.text}
                  </Text>{' '}
                  {/* maxW is based off the post width, 35rem */}
                </Flex>
              </Flex>
            ))}
            {mockComments.length > 2 && (
              <Text fontSize="xs" as="i" mb="1rem">
                View all comments...
              </Text>
            )}
          </Flex>
        </CardFooter>
      )}
      {isOpen && (
        <CardFooter p="0 1.5rem 0.75rem">
          <Flex direction="column" align="left" w="100%">
            <Divider mb="1rem" w="100%" />
            <Flex direction="row" justifyItems="center" w="30rem">
              <Avatar size="sm" name="User Icon" />
              <Textarea
                placeholder="Where do I even begin..."
                resize="none"
                ml="10px"
                size="sm"
              />
            </Flex>
          </Flex>
        </CardFooter>
      )}
    </Card>
  );
};

export default Post;
