import React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type WaveSurfer from 'wavesurfer.js';
import WavesurferPlayer from '@wavesurfer/react';
import { Button, Flex, IconButton } from '@chakra-ui/react';
import { FaRegCirclePlay } from 'react-icons/fa6';
import { FaRegCirclePause } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';

/*
Resources used:
https://wavesurfer.xyz/examples/?react.js

Example code:
https://github.com/katspaugh/wavesurfer-react

*/

type SizeType = 'Practice' | 'SaveSessionModal' | 'Post';

interface props {
  url: string;
  deleteTake?: (url: string) => void;
  context: SizeType;
}

const AudioDisplay = ({ url, deleteTake, context }: props) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const sizes = {
    Practice: {
      width: '20rem',
      height: 75,
    },
    SaveSessionModal: {
      width: '15rem',
      height: 75,
    },
    Post: {
      width: '25rem',
      height: 50,
    },
  };

  const returnWidth = (context: SizeType) => {
    // cant figure out how to get auto width based on container so using this workaround
    return sizes[context].width as string;
  };
  const returnHeight = (context: SizeType) => {
    // cant figure out how to get auto width based on container so using this workaround
    return sizes[context].height as number;
  };

  // Play/pause the audio
  const onPlayPause = () => {
    setIsPlaying((playing) => {
      if (wavesurfer?.isPlaying() !== !playing) {
        wavesurfer?.playPause();
        return !playing;
      }
      return playing;
    });
  };

  const onDelete = () => {
    if (deleteTake) {
      deleteTake(url);
    }
  };

  return (
    <Flex direction="row" alignItems="center">
      {isPlaying ? (
        <IconButton
          icon={<FaRegCirclePause />}
          onClick={onPlayPause}
          m="1rem"
          variant="ghost"
          colorScheme="gray"
          aria-label="Pause audio"
          fontSize="2xl"
        />
      ) : (
        <IconButton
          icon={<FaRegCirclePlay />}
          onClick={onPlayPause}
          m="1rem"
          variant="ghost"
          colorScheme="gray"
          aria-label="Play audio"
          fontSize="2xl"
        />
      )}
      <WavesurferPlayer
        height={returnHeight(context)} // cant figure out how to get auto width based on container so using this workaround
        width={returnWidth(context)} // cant figure out how to get auto width based on container so using this workaround
        waveColor={'rgb(255, 127, 80)'} // hardcoded coral for now..
        url={url}
        onReady={(ws) => setWavesurfer(ws)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {context === 'Practice' && (
        <IconButton
          icon={<MdDelete />}
          onClick={onDelete}
          m="1rem"
          variant="ghost"
          colorScheme="gray"
          aria-label="Pause audio"
          fontSize="2xl"
        />
      )}
    </Flex>
  );
};

export default AudioDisplay;
