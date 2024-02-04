import React from 'react';
import { feedPost, dummyFeed } from '../dummyData/dummyData';
import Post from './components/Post';
import { Flex } from '@chakra-ui/react';

const Feed = () => {
  /*
  grab array of feedPosts from api
  either useEffect or loader, prob loader at the Root level
  */

  return (
    <Flex direction="column" align="center">
      flexBox to contain feed
      {dummyFeed.map((post: feedPost) => {
        return <Post post={post} />;
      })}
    </Flex>
  );
};

export default Feed;
