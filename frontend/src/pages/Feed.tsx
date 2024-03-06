import React from 'react';
import { feedPost, dummyFeed } from '../dummyData/dummyData';
import Post from './components/Post';
import { Flex } from '@chakra-ui/react';
import { useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import { FrontendSessionDto } from '../types/sessions.types';

const Feed = ({}) => {
  /*
  grab array of feedPosts from api
  either useEffect or loader, prob loader at the Root level
  */
  const initRender = useOutletContext() as RenderPayloadDTO;

  return (
    <Flex direction="column" align="center">
      {initRender.feed.map((post: FrontendSessionDto) => {
        return <Post post={post} musicianId={initRender.musician.id} />;
      })}
    </Flex>
  );
};

export default Feed;
