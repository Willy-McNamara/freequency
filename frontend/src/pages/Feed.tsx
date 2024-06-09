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
import { useNavigate, useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import { FrontendSessionDto } from '../types/sessions.types';
import axios from 'axios';

const Feed = () => {
  const initRender = useOutletContext() as RenderPayloadDTO;

  const navigate = useNavigate();

  const [posts, setPosts] = useState(initRender.feed);
  const [isLoading, setIsLoading] = useState(false);
  const [endOfFeed, setEndOfFeed] = useState(false);
  const loaderRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    axios
      .post(`/sessions/nextChunk`, {
        cursor: posts[posts.length - 1].id,
      })
      .then((res) => {
        if (res.data.length === 0) {
          setEndOfFeed(true);
        } else {
          setPosts((prevItems) => [...prevItems, ...res.data]);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
        }
        console.log(err);
      });
  }, [isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchData();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchData]);

  return (
    <Flex direction="column" align="center">
      {posts.map((post: FrontendSessionDto) => {
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
