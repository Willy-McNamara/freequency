import React, { useCallback, useEffect, useRef, useState } from 'react';
import { dummySession } from '../types/sessions.types';
import Post from './components/Post';
import {
  Box,
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
} from '@chakra-ui/react';
import { useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import { FrontendSessionDto } from '../types/sessions.types';
import axios from 'axios';

const Feed = () => {
  const initRender = useOutletContext() as RenderPayloadDTO;

  const [posts, setPosts] = useState(initRender.feed);
  const [isLoading, setIsLoading] = useState(false);
  const [endOfFeed, setEndOfFeed] = useState(false);
  const loaderRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    console.log(
      'about to POST nextChunk, here is cursor:',
      posts[posts.length - 1].id,
    );

    axios
      .post(`http://localhost:3000/sessions/nextChunk`, {
        cursor: posts[posts.length - 1].id,
      })
      .then((res) => {
        console.log('response from nextChunk:', res.data);
        if (res.data.length === 0) {
          setEndOfFeed(true);
        } else {
          setPosts((prevItems) => [...prevItems, ...res.data]);
          setIsLoading(false);
        }
      })
      .catch((err) => console.log(err));
  }, [isLoading]);

  useEffect(() => {
    console.log('useEffect triggered');
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        console.log('intersection callback triggered, target isIntersecting');
        fetchData();
      }
    });

    if (loaderRef.current) {
      console.log('useEffect sets observer on loaderRef.current');
      observer.observe(loaderRef.current);
    }

    return () => {
      console.log(
        'useEffect cleanup running, her is loaderRef.current',
        loaderRef.current,
      );
      if (loaderRef.current) {
        console.log('useEffect unobservers loaderRef');
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchData]);

  return (
    <Flex direction="column" align="center">
      {posts.map((post: FrontendSessionDto) => {
        console.log('post in feed:', post);
        return (
          <Post post={post} key={post.id} musicianId={initRender.musician.id} />
        );
      })}
      {!endOfFeed && (
        <Box
          ref={loaderRef}
          padding="6"
          boxShadow="lg"
          bg="white"
          w="35rem"
          m="1.5rem"
        >
          <SkeletonCircle size="10" />
          <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
        </Box>
      )}
    </Flex>
  );
};

export default Feed;
