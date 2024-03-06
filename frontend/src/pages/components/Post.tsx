import React, { useState } from 'react';
import { feedPost } from '../../dummyData/dummyData';
import {
  Avatar,
  Card,
  CardHeader,
  Flex,
  Heading,
  Text,
  CardBody,
  CardFooter,
  Button,
  Badge,
  useBoolean,
} from '@chakra-ui/react';
import { ChatIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { FrontendSessionDto, NewGasUpDto } from '../../types/sessions.types';
import { CommentDto, mockComments } from '../../types/sessions.types';
import AddComment from './AddComment';
import ViewAllComments from './ViewAllComments';
import CommentDisplay from './CommentDisplay';
import { FaGasPump } from 'react-icons/fa6';
import ViewAllLikes from './ViewAllLikes';
import { GasUpDto } from '../../types/sessions.types';
import axios from 'axios';

type props = {
  post: FrontendSessionDto;
  musicianId: number;
};

const Post = ({ post, musicianId }: props) => {
  const [isOpen, setIsOpen] = useBoolean(false);
  // if the user has already liked this post, set state true
  const [isLiked, setIsLiked] = useBoolean(
    post.gasUps.some((gasUp) => gasUp.musicianId === musicianId),
  );

  const [commentList, setCommentList] = useState<CommentDto[] | []>(
    post.comments,
  );
  const [gasUpsList, setGasUpsList] = useState<GasUpDto[] | []>(post.gasUps);

  const handleNewComment = (newComment: CommentDto) => {
    setCommentList([...commentList, newComment]);
    setIsOpen.off();
  };

  // this has to be derived from state, so that it rerenders when the comment list is updated
  const subComments: CommentDto[] | null = true ? commentList?.slice(-2) : null;

  const toggleCommentBox = () => {
    console.log('comment box clicked');
    setIsOpen.toggle();
  };

  const handleGasUp = () => {
    console.log('gas up clicked');
    // don't let somebody re-gas a post
    if (isLiked) return;

    // hahaha i think out of laziness I am just going to not implement UNLIKING for now
    // if you like it, that's it you have now liked the post forever lol
    const newGasUp: NewGasUpDto = {
      sessionId: post.id,
      musicianId: post.musicianId,
    };

    axios
      .post('/sessions/addGasUp', newGasUp)
      .then((res) => {
        console.log('res from gasUp post:', res);
        setIsLiked.on();
        setGasUpsList([...gasUpsList, res.data]);
      })
      .catch((error) => {
        console.error('Error trying to add gasUp:', error);
        setIsLiked.off();
      });
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
            {commentList.length > 2 && (
              <ViewAllComments
                commentList={commentList}
                handleNewComment={handleNewComment}
              />
            )}
          </Flex>
        </CardFooter>
      )}
      {isOpen && (
        <AddComment handleNewComment={handleNewComment} sessionId={post.id} />
      )}
    </Card>
  );
};

export default Post;
