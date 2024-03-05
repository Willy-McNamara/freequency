import React, { useState } from 'react';
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
import AddComment from './AddComment';
import ViewAllComments from './ViewAllComments';
import CommentDisplay from './CommentDisplay';
import { FaGasPump } from 'react-icons/fa6';
import LikesDisplay from './LikesDisplay';
import ViewAllLikes from './ViewAllLikes';
import { dummyGasUps, dummyGasUp, GasUpDto } from '../../types/sessions.types';

type props = {
  post: FrontendSessionDto;
};

const Post = ({ post }: props) => {
  const [isOpen, setIsOpen] = useBoolean(false);
  const [isLiked, setIsLiked] = useBoolean(false);
  // check if post has comments, if so, grab only the latest two
  const [commentList, setCommentList] = useState<xCommentDto[] | []>(
    mockComments,
  );
  const [gasUpsList, setGasUpsList] = useState<GasUpDto[] | []>(dummyGasUps);

  const handleNewComment = (newComment: xCommentDto) => {
    setCommentList([...commentList, newComment]);
    setIsOpen.off();
  };

  // this has to be derived from state, so that it rerenders when the comment list is updated
  const subComments: xCommentDto[] | null = true
    ? commentList?.slice(-2)
    : null;

  const toggleCommentBox = () => {
    console.log('comment box clicked');
    setIsOpen.toggle();
  };

  const handleGasUp = () => {
    console.log('gas up clicked');
    setIsLiked.toggle();
    // post like to backend.. untoggle if fails
    if (isLiked) {
      setGasUpsList(gasUpsList.filter((gasUp) => gasUp.id !== dummyGasUp.id));
    } else {
      setGasUpsList([...gasUpsList, dummyGasUp]);
    }
  };

  const likes = ['user1', 'user2', 'user3', 'user4', 'user5'];

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
      <CardBody pt="0" pb="0">
        <Text p="0.5rem 0px 0.5rem" fontSize="xl">
          {post.title} | {post.duration} minutes
        </Text>
        <Text m="1rem 0">{post.notes}</Text>
        <Flex direction="row">
          <Badge colorScheme="green"> Audio or Video, recorded take here</Badge>
        </Flex>
        <Flex mt="1rem" align="center">
          {/* <LikesDisplay likes={likes} /> */}
          <ViewAllLikes gasUps={gasUpsList} />
        </Flex>
      </CardBody>

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
        <Button
          flex="1"
          variant={isLiked ? 'solid' : 'ghost'}
          onClick={handleGasUp}
          leftIcon={<FaGasPump />}
        >
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
              <CommentDisplay comment={comment} />
            ))}
            {mockComments.length > 2 && (
              <ViewAllComments
                commentList={commentList}
                handleNewComment={handleNewComment}
              />
            )}
          </Flex>
        </CardFooter>
      )}
      {isOpen && <AddComment handleNewComment={handleNewComment} />}
    </Card>
  );
};

export default Post;
