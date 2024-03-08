import React, { useCallback, useEffect, useRef, useState } from 'react';
import { feedPost, dummyFeed } from '../dummyData/dummyData';
import Post from './components/Post';
import { Flex, Spinner } from '@chakra-ui/react';
import { useOutletContext } from 'react-router';
import { RenderPayloadDTO } from '../types/app.types';
import { FrontendSessionDto } from '../types/sessions.types';
import axios from 'axios';

const Feed = () => {
  const initRender = useOutletContext() as RenderPayloadDTO;

  const [posts, setPosts] = useState(initRender.feed);
  const [isLoading, setIsLoading] = useState(false);
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
        // if res.data is empty, trigger some kind of "end of feed" message
        setPosts((prevItems) => [...prevItems, ...res.data]);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }, [isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        console.log('intersection callback triggered, target isIntersecting');
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
  console.log('logging isLoading right before Feed return:', isLoading);
  return (
    <Flex direction="column" align="center">
      {!isLoading &&
        posts.map((post: FrontendSessionDto) => {
          console.log('post in feed:', post);
          return <Post post={post} musicianId={initRender.musician.id} />;
        })}
      <div ref={loaderRef}>{isLoading && <Spinner />}</div>
    </Flex>
  );
};

export default Feed;
